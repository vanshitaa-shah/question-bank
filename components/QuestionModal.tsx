"use client";

import React, { useActionState, useEffect, startTransition, useOptimistic } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormStatusButton, FormStatusIndicator, FormErrorBoundary } from "@/components/FormStatus";
import { Question, Difficulty } from "@/types";

interface QuestionModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (questionData: Omit<Question, "_id">) => Promise<void>;
  readonly isPending?: boolean;
  readonly initialValues?: Partial<Omit<Question, "_id">>;
  readonly mode?: "add" | "edit";
}

interface QuestionFormState {
  readonly error?: string | null;
  readonly success?: boolean;
}

const initialState: QuestionFormState = {
  error: null,
  success: false,
};

// Form action for React 19's useActionState
async function submitQuestionAction(
  prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  try {
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const difficulty = formData.get("difficulty") as Difficulty;

    // Enhanced validation
    if (!question?.trim()) {
      return { error: "Question is required", success: false };
    }
    if (!answer?.trim()) {
      return { error: "Answer is required", success: false };
    }
    if (!difficulty) {
      return { error: "Difficulty is required", success: false };
    }

    // Additional validation
    if (question.trim().length < 10) {
      return { error: "Question must be at least 10 characters long", success: false };
    }
    if (answer.trim().length < 5) {
      return { error: "Answer must be at least 5 characters long", success: false };
    }

    return { success: true, error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to submit question",
      success: false 
    };
  }
}

// React 19: Optimized Textarea component using ref as prop
function OptimizedTextarea(props: React.ComponentProps<"textarea">) {
  return <Textarea {...props} />;
}

export default function QuestionModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending = false,
  initialValues = {},
  mode = "add",
}: QuestionModalProps) {
  // React 19: useActionState for enhanced form handling
  const [formState, , pending] = useActionState(submitQuestionAction, initialState);
  
  // React 19: useOptimistic for optimistic UI updates
  const [optimisticSubmitting, addOptimisticSubmission] = useOptimistic(
    false,
    (state, optimisticValue: boolean) => optimisticValue
  );

  const isSubmitting = isPending || pending || optimisticSubmitting;

  // Enhanced form reset handling
  useEffect(() => {
    if (!isOpen) {
      const form = document.getElementById('question-form') as HTMLFormElement;
      if (form && mode === "add") {
        form.reset();
      }
    }
  }, [isOpen, mode]);

  const handleSubmit = async (formData: FormData) => {
    try {
      addOptimisticSubmission(true);
      
      const questionData: Omit<Question, "_id"> = {
        question: (formData.get("question") as string).trim(),
        answer: (formData.get("answer") as string).trim(),
        difficulty: formData.get("difficulty") as Difficulty,
        keywords: (formData.get("keywords") as string)
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
      };

      await onSubmit(questionData);
      
      if (mode === "add") {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to submit question:", error);
    } finally {
      addOptimisticSubmission(false);
    }
  };

  const handleFormAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await submitQuestionAction(formState, formData);
      if (!result.error) {
        await handleSubmit(formData);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "edit" ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        
        <FormErrorBoundary>
          <form id="question-form" action={handleFormAction} className="space-y-6">
            {/* Enhanced error display */}
            {formState.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">
                  {formState.error}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Question Field */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium text-gray-700">
                  Question <span className="text-red-500">*</span>
                </Label>
                <OptimizedTextarea
                  id="question"
                  name="question"
                  defaultValue={initialValues.question || ""}
                  placeholder="Enter your question (minimum 10 characters)"
                  className="min-h-[100px] resize-y"
                  required
                  minLength={10}
                  aria-describedby="question-hint"
                />
                <p id="question-hint" className="text-xs text-gray-500">
                  Provide a clear and specific question.
                </p>
              </div>
              
              {/* Answer Field */}
              <div className="space-y-2">
                <Label htmlFor="answer" className="text-sm font-medium text-gray-700">
                  Answer <span className="text-red-500">*</span>
                </Label>
                <OptimizedTextarea
                  id="answer"
                  name="answer"
                  defaultValue={initialValues.answer || ""}
                  placeholder="Enter the answer (minimum 5 characters)"
                  className="min-h-[100px] resize-y"
                  required
                  minLength={5}
                  aria-describedby="answer-hint"
                />
                <p id="answer-hint" className="text-xs text-gray-500">
                  Provide a comprehensive and accurate answer.
                </p>
              </div>
              
              {/* Difficulty Field */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                  Difficulty Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="difficulty"
                  defaultValue={initialValues.difficulty || "moderate"}
                  required
                >
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Keywords Field */}
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                  Keywords (optional)
                </Label>
                <Input
                  id="keywords"
                  name="keywords"
                  defaultValue={
                    initialValues.keywords ? initialValues.keywords.join(", ") : ""
                  }
                  placeholder="e.g. javascript, arrays, functions"
                  aria-describedby="keywords-hint"
                />
                <p id="keywords-hint" className="text-xs text-gray-500">
                  Separate multiple keywords with commas. These help with searching.
                </p>
              </div>
            </div>
            
            {/* React 19: Form Status Indicator */}
            <FormStatusIndicator className="justify-center" />
            
            <DialogFooter className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              
              <FormStatusButton
                variant="default"
                className="flex-1 sm:flex-none"
                loadingText={mode === "edit" ? "Saving..." : "Adding..."}
                disabled={isSubmitting}
              >
                {mode === "edit" ? "Save Changes" : "Add Question"}
              </FormStatusButton>
            </DialogFooter>
          </form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}