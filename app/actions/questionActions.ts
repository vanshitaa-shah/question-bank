"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Question, QuestionFormData, ActionState } from "@/types";
import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error("All retry attempts failed");
}

// Next.js 15: Enhanced caching with tags
const getCachedQuestions = unstable_cache(
  async (topicId: string): Promise<readonly Question[]> => {
    return withRetry(async () => {
      await connectDB();
      const topic = await Topic.findById(topicId).maxTimeMS(5000);
      return JSON.parse(JSON.stringify(topic?.questions || []));
    });
  },
  ["questions"],
  {
    tags: ["questions"],
    revalidate: 3600, // Cache for 1 hour
  }
);

export async function getQuestions(topicId: string): Promise<readonly Question[]> {
  try {
    return await getCachedQuestions(topicId);
  } catch (error) {
    console.error("Failed to get questions:", error);
    return [];
  }
}

export async function addQuestion(
  topicId: string,
  questionData: QuestionFormData
): Promise<readonly Question[]> {
  return withRetry(async () => {
    await connectDB();
    const topic = await Topic.findById(topicId).maxTimeMS(5000);
    if (!topic) {
      throw new Error("Topic not found");
    }

    // Enhanced validation
    if (!questionData.question?.trim()) {
      throw new Error("Question text is required");
    }
    if (!questionData.answer?.trim()) {
      throw new Error("Answer text is required");
    }
    if (!questionData.difficulty) {
      throw new Error("Difficulty level is required");
    }

    // Check for duplicate questions
    const isDuplicate = topic.questions.some(
      (q: Question) => 
        q.question.toLowerCase().trim() === questionData.question.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      throw new Error("A question with this text already exists");
    }

    const newQuestion: Question = {
      ...questionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    topic.questions.push(newQuestion);
    await topic.save();
    
    // Next.js 15: Revalidate with tags
    revalidateTag("questions");
    revalidatePath(`/questions/${topicId}`);
    
    return JSON.parse(JSON.stringify(topic.questions));
  });
}

export async function updateQuestion(
  topicId: string,
  questionId: string,
  updates: Partial<QuestionFormData>
): Promise<Question> {
  return withRetry(async () => {
    await connectDB();
    const topic = await Topic.findById(topicId).maxTimeMS(5000);
    if (!topic) {
      throw new Error("Topic not found");
    }

    const question = topic.questions.id(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    // Enhanced validation for updates
    if (updates.question !== undefined && !updates.question?.trim()) {
      throw new Error("Question text cannot be empty");
    }
    if (updates.answer !== undefined && !updates.answer?.trim()) {
      throw new Error("Answer text cannot be empty");
    }

    // Check for duplicate question text (if updating question text)
    if (updates.question && updates.question !== question.question) {
      const isDuplicate = topic.questions.some(
        (q: Question) => 
          q._id?.toString() !== questionId &&
          q.question.toLowerCase().trim() === updates.question!.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        throw new Error("A question with this text already exists");
      }
    }

    Object.assign(question, {
      ...updates,
      updatedAt: new Date(),
    });

    await topic.save();
    
    // Next.js 15: Revalidate with tags
    revalidateTag("questions");
    revalidatePath(`/questions/${topicId}`);
    
    return JSON.parse(JSON.stringify(question));
  });
}

export async function deleteQuestion(
  topicId: string, 
  questionId: string
): Promise<ActionState> {
  try {
    return await withRetry(async () => {
      await connectDB();
      const topic = await Topic.findById(topicId).maxTimeMS(5000);
      if (!topic) {
        return { success: false, error: "Topic not found" };
      }

      const question = topic.questions.id(questionId);
      if (!question) {
        return { success: false, error: "Question not found" };
      }

      question.deleteOne();
      await topic.save();
      
      // Next.js 15: Revalidate with tags
      revalidateTag("questions");
      revalidatePath(`/questions/${topicId}`);
      
      return { success: true, error: null };
    });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete question" 
    };
  }
}
