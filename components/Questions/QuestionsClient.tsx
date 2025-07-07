"use client";

import React, {
  useState,
  useTransition,
  useOptimistic,
  Suspense,
  useActionState,
} from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Question } from "@/types";
import { addQuestion, deleteQuestion, updateQuestion } from "@/app/actions/questionActions";
import { searchQuestions } from "@/app/actions/questionSearchActions";
import QuestionFilters from "./DifficultyFilter";
import QuestionList from "./QuestionListProps";
import QuestionModal from "@/components/QuestionModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";

interface QuestionsClientProps {
  readonly initialQuestions: Question[];
  readonly topicId: string;
  readonly topicName: string;
}

interface QuestionActionState {
  readonly success: boolean;
  readonly error?: string | null;
}

const initialActionState: QuestionActionState = {
  success: false,
  error: null,
};

// Server action for adding questions with React 19's useActionState
async function addQuestionAction(
  prevState: QuestionActionState,
  formData: FormData
): Promise<QuestionActionState> {
  try {
    const topicId = formData.get("topicId") as string;
    const questionData = JSON.parse(formData.get("questionData") as string);
    
    await addQuestion(topicId, questionData);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add question",
    };
  }
}

// Server action for updating questions
async function updateQuestionAction(
  prevState: QuestionActionState,
  formData: FormData
): Promise<QuestionActionState> {
  try {
    const topicId = formData.get("topicId") as string;
    const questionId = formData.get("questionId") as string;
    const questionData = JSON.parse(formData.get("questionData") as string);
    
    await updateQuestion(topicId, questionId, questionData);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update question",
    };
  }
}

export default function QuestionsClient({
  initialQuestions,
  topicId,
  topicName,
}: QuestionsClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  
  // React 19: useOptimistic for optimistic UI updates
  const [optimisticQuestions, addOptimisticQuestion] = useOptimistic<
    Question[],
    { type: 'add' | 'delete' | 'update'; question: Question | Omit<Question, "_id">; questionId?: string }
  >(questions, (state, action) => {
    switch (action.type) {
      case 'add':
        return [
          { ...action.question as Omit<Question, "_id">, _id: Math.random().toString(36).slice(2) },
          ...state,
        ];
      case 'delete':
        return state.filter((q) => q._id !== action.questionId);
      case 'update':
        return state.map((q) => 
          q._id === action.questionId ? { ...q, ...action.question } : q
        );
      default:
        return state;
    }
  });

  // React 19: useActionState for form actions (using underscore for unused parameters)
  const [addState, , addPending] = useActionState(addQuestionAction, initialActionState);
  const [updateState, , updatePending] = useActionState(updateQuestionAction, initialActionState);
  
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions);
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "easy" | "moderate" | "hard"
  >("all");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    question: Question | null;
  }>({ open: false, question: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    questionId: string | null;
  }>({ open: false, questionId: null });

  const handleFilterChange = async (
    newSearchQuery: string = searchQuery,
    newDifficultyFilter: "all" | "easy" | "moderate" | "hard" = difficultyFilter
  ) => {
    setSearchQuery(newSearchQuery);
    setDifficultyFilter(newDifficultyFilter);
    
    startTransition(async () => {
      try {
        const filtered = await searchQuestions(
          topicId,
          newSearchQuery,
          newDifficultyFilter,
          100 // Increased limit for better UX
        );
        
        // Convert readonly array to mutable array for state
        setFilteredQuestions([...filtered]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      }
    });
  };

  const handleSearchChange = (query: string) => {
    handleFilterChange(query, difficultyFilter);
  };

  const handleDifficultyChange = (
    difficulty: "all" | "easy" | "moderate" | "hard"
  ) => {
    handleFilterChange(searchQuery, difficulty);
  };

  const handleAddQuestion = async (questionData: Omit<Question, "_id">) => {
    setIsAddModalOpen(false);
    setError(null);
    
    // Optimistic update
    addOptimisticQuestion({ type: 'add', question: questionData });
    
    startTransition(async () => {
      try {
        const questionExists = questions.some(
          (q) =>
            q.question.toLowerCase() === questionData.question.toLowerCase()
        );
        if (questionExists) {
          throw new Error("A question with this text already exists");
        }
        
        const updatedQuestions = await addQuestion(topicId, questionData);
        // Convert readonly array to mutable array for state
        setQuestions([...updatedQuestions]);
        
        // Refresh filters if they are active, otherwise set to all questions
        const hasActiveFilters = searchQuery.trim() !== "" || difficultyFilter !== "all";
        if (hasActiveFilters) {
          // Re-apply current filters to include the new question if it matches
          handleFilterChange(searchQuery, difficultyFilter);
        } else {
          setFilteredQuestions([...updatedQuestions]);
        }
      } catch (err) {
        setError((err as Error).message || "Failed to add question");
        // Revert optimistic update on error by refreshing the current view
        setQuestions([...questions]);
        const hasActiveFilters = searchQuery.trim() !== "" || difficultyFilter !== "all";
        if (hasActiveFilters) {
          handleFilterChange(searchQuery, difficultyFilter);
        } else {
          setFilteredQuestions([...questions]);
        }
      }
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditModal({ open: true, question });
  };

  const handleEditSubmit = async (questionData: Omit<Question, "_id">) => {
    if (!editModal.question?._id) return;
    
    const questionId = editModal.question._id;
    setEditModal({ open: false, question: null });
    setError(null);
    
    // Optimistic update
    addOptimisticQuestion({ type: 'update', question: questionData, questionId });
    
    startTransition(async () => {
      try {
        const updatedQuestion = await updateQuestion(topicId, questionId, questionData);
        setQuestions(prev => 
          prev.map(q => q._id === questionId ? updatedQuestion : q)
        );
        
        // Refresh filters to ensure the updated question is properly filtered
        const hasActiveFilters = searchQuery.trim() !== "" || difficultyFilter !== "all";
        if (hasActiveFilters) {
          handleFilterChange(searchQuery, difficultyFilter);
        } else {
          setFilteredQuestions(prev => 
            prev.map(q => q._id === questionId ? updatedQuestion : q)
          );
        }
      } catch (err) {
        setError((err as Error).message || "Failed to update question");
        // Revert optimistic update on error
        setQuestions([...questions]);
        
        // Refresh filters to ensure consistency
        const hasActiveFilters = searchQuery.trim() !== "" || difficultyFilter !== "all";
        if (hasActiveFilters) {
          handleFilterChange(searchQuery, difficultyFilter);
        } else {
          setFilteredQuestions([...questions]);
        }
      }
    });
  };

  const handleDeleteRequest = (questionId: string) => {
    setConfirmDialog({ open: true, questionId });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.questionId) {
      await handleDeleteQuestion(confirmDialog.questionId);
    }
    setConfirmDialog({ open: false, questionId: null });
  };

  // Delete question with optimistic UI
  const handleDeleteQuestion = (questionId: string) => {
    setError(null);
    
    // Optimistic update
    addOptimisticQuestion({ type: 'delete', question: {} as Question, questionId });
    
    startTransition(async () => {
      try {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
        setFilteredQuestions((prev) => prev.filter((q) => q._id !== questionId));
        await deleteQuestion(topicId, questionId);
      } catch (err) {
        setError((err as Error).message || "Failed to delete question");
        // Revert optimistic update on error
        setQuestions(questions);
        setFilteredQuestions(filteredQuestions);
      }
    });
  };

  // Display logic: Show filtered results when filters are active, otherwise show optimistic questions
  const hasActiveFilters = searchQuery.trim() !== "" || difficultyFilter !== "all";
  const displayQuestions = hasActiveFilters ? filteredQuestions : optimisticQuestions;
  const isLoading = isPending || addPending || updatePending;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={`Questions: ${topicName}`}>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </PageHeader>
      
      {/* Error display with better styling */}
      {(error || addState.error || updateState.error) && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            {error || addState.error || updateState.error}
          </p>
        </div>
      )}
      
      <QuestionFilters
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={handleDifficultyChange}
      />
      
      {/* Scrollable content with loading state */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading questions...</div>}>
          <QuestionList
            filteredQuestions={displayQuestions}
            questions={questions}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteRequest}
            fixedWidth
          />
        </Suspense>
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              Processing...
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal with enhanced props */}
      <QuestionModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddQuestion}
        isPending={addPending}
        mode="add"
      />
      
      {/* Edit Question Modal with proper initial values */}
      <QuestionModal
        isOpen={editModal.open}
        onOpenChange={(open: boolean) =>
          setEditModal({ open, question: open ? editModal.question : null })
        }
        onSubmit={handleEditSubmit}
        isPending={updatePending}
        initialValues={editModal.question || {}}
        mode="edit"
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open: boolean) => 
          setConfirmDialog({ open, questionId: open ? confirmDialog.questionId : null })
        }
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ open: false, questionId: null })}
      />
    </div>
  );
}
