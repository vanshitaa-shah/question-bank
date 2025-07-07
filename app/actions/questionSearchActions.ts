"use server";

import { unstable_cache } from "next/cache";
import { Question, SearchParams, SearchResult } from "@/types";
import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";

// Next.js 15: Cached search function
const getCachedSearchResults = unstable_cache(
  async (
    topicId: string,
    query: string,
    difficulty: "all" | "easy" | "moderate" | "hard",
    limit: number
  ): Promise<readonly Question[]> => {
    await connectDB();
    const topic = await Topic.findById(topicId);
    
    if (!topic) {
      return [];
    }

    let filtered = [...topic.questions];

    // Filter by difficulty
    if (difficulty !== "all") {
      filtered = filtered.filter((q: Question) => q.difficulty === difficulty);
    }

    // Filter by search query (question, answer, or keywords)
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter((q: Question) =>
        q.question.toLowerCase().includes(searchTerm) ||
        q.answer.toLowerCase().includes(searchTerm) ||
        q.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Sort by relevance (questions containing search term first, then answers, then keywords)
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered.sort((a: Question, b: Question) => {
        const aQuestionMatch = a.question.toLowerCase().includes(searchTerm);
        const bQuestionMatch = b.question.toLowerCase().includes(searchTerm);
        const aAnswerMatch = a.answer.toLowerCase().includes(searchTerm);
        const bAnswerMatch = b.answer.toLowerCase().includes(searchTerm);

        if (aQuestionMatch && !bQuestionMatch) return -1;
        if (!aQuestionMatch && bQuestionMatch) return 1;
        if (aAnswerMatch && !bAnswerMatch) return -1;
        if (!aAnswerMatch && bAnswerMatch) return 1;
        return 0;
      });
    }

    return JSON.parse(JSON.stringify(filtered.slice(0, limit)));
  },
  ["question-search"],
  {
    tags: ["questions", "search"],
    revalidate: 300, // Cache for 5 minutes
  }
);

export async function searchQuestions(
  topicId: string,
  query: string = "",
  difficulty: "all" | "easy" | "moderate" | "hard" = "all",
  limit: number = 50
): Promise<readonly Question[]> {
  try {
    return await getCachedSearchResults(topicId, query, difficulty, limit);
  } catch (error) {
    console.error("Failed to search questions:", error);
    return [];
  }
}

// Enhanced search with pagination and metadata
export async function searchQuestionsWithPagination(
  topicId: string,
  params: SearchParams
): Promise<SearchResult<Question>> {
  try {
    await connectDB();
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return { items: [], total: 0, hasMore: false };
    }

    const {
      query = "",
      difficulty = "all",
      limit = 20,
      offset = 0
    } = params;

    let filtered = [...topic.questions];

    // Apply filters
    if (difficulty !== "all") {
      filtered = filtered.filter((q: Question) => q.difficulty === difficulty);
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter((q: Question) =>
        q.question.toLowerCase().includes(searchTerm) ||
        q.answer.toLowerCase().includes(searchTerm) ||
        q.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Sort by relevance and then by creation date (newest first)
    filtered.sort((a: Question, b: Question) => {
      if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        const aQuestionMatch = a.question.toLowerCase().includes(searchTerm);
        const bQuestionMatch = b.question.toLowerCase().includes(searchTerm);
        
        if (aQuestionMatch && !bQuestionMatch) return -1;
        if (!aQuestionMatch && bQuestionMatch) return 1;
      }
      
      // Sort by creation date (newest first)
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    const filteredTotal = filtered.length;
    const paginatedResults = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredTotal;

    return {
      items: JSON.parse(JSON.stringify(paginatedResults)),
      total: filteredTotal,
      hasMore
    };
  } catch (error) {
    console.error("Failed to search questions with pagination:", error);
    return { items: [], total: 0, hasMore: false };
  }
}
