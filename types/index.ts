export type Difficulty = "easy" | "moderate" | "hard";

export interface Question {
  readonly _id?: string;
  readonly question: string;
  readonly answer: string;
  readonly difficulty: Difficulty;
  readonly keywords: readonly string[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface TopicType {
  readonly _id?: string;
  readonly name: string;
  readonly questions: readonly Question[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly description?: string;
}

// Enhanced type safety for form data
export type QuestionFormData = Omit<Question, "_id" | "createdAt" | "updatedAt">;
export type TopicFormData = Omit<TopicType, "_id" | "questions" | "createdAt" | "updatedAt">;

// Action state types for React 19 useActionState
export interface ActionState<T = unknown> {
  readonly success: boolean;
  readonly error: string | null;
  readonly data?: T;
}

// Search and filter types
export interface SearchParams {
  readonly query?: string;
  readonly difficulty?: Difficulty | "all";
  readonly limit?: number;
  readonly offset?: number;
}

export interface SearchResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly hasMore: boolean;
}
