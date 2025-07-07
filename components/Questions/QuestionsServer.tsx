import React, { Suspense } from "react";
import { use } from "react";
import { getQuestions } from "@/app/actions/questionActions";
import { searchQuestions } from "@/app/actions/questionSearchActions";
import { Question } from "@/types";
import QuestionsClient from "./QuestionsClient";

interface QuestionsServerProps {
  readonly topicId: string;
  readonly topicName: string;
  readonly initialQuery?: string;
  readonly initialDifficulty?: "all" | "easy" | "moderate" | "hard";
}

// React 19: Enhanced data fetching with use() hook
function QuestionsData({ 
  topicId, 
  initialQuery = "", 
  initialDifficulty = "all" 
}: Pick<QuestionsServerProps, 'topicId' | 'initialQuery' | 'initialDifficulty'>) {
  // React 19: use() hook for data fetching
  const questionsPromise = initialQuery || initialDifficulty !== "all"
    ? searchQuestions(topicId, initialQuery, initialDifficulty)
    : getQuestions(topicId);

  const questions = use(questionsPromise);

  return [...questions] as Question[]; // Convert readonly to mutable for client component
}

function QuestionsLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-12"></div>
              <div className="h-5 bg-gray-200 rounded w-12"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuestionsServer({
  topicId,
  topicName,
  initialQuery,
  initialDifficulty,
}: QuestionsServerProps) {
  return (
    <Suspense fallback={<QuestionsLoadingSkeleton />}>
      <QuestionsServerWrapper
        topicId={topicId}
        topicName={topicName}
        initialQuery={initialQuery}
        initialDifficulty={initialDifficulty}
      />
    </Suspense>
  );
}

function QuestionsServerWrapper({
  topicId,
  topicName,
  initialQuery,
  initialDifficulty,
}: QuestionsServerProps) {
  try {
    const questions = QuestionsData({ topicId, initialQuery, initialDifficulty });

    return (
      <QuestionsClient
        initialQuestions={questions}
        topicId={topicId}
        topicName={topicName}
      />
    );
  } catch (error) {
    throw error; // Let error boundary handle it
  }
}
