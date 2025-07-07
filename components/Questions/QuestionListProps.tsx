"use client";

import React from "react";
import { Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface QuestionListProps {
  filteredQuestions: Question[];
  questions: Question[];
  onEdit?: (question: Question) => void;
  onDelete?: (questionId: string) => void;
  fixedWidth?: boolean;
}

export default function QuestionList({
  filteredQuestions,
  questions,
  onEdit,
  onDelete,
  fixedWidth,
}: QuestionListProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {questions.length === 0
          ? 'No questions yet. Click "Add Question" to create your first question.'
          : "No questions match your filters."}
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className={`space-y-4 ${
        fixedWidth ? "max-w-screen-md mx-auto" : ""
      }`.trim()}
    >
      {filteredQuestions.map((question) => (
        <AccordionItem
          key={question._id}
          value={question._id || ""}
          className="border rounded-lg overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 group">
            <div className="flex items-center gap-3 text-left w-full">
              <span className="font-medium">{question.question}</span>
              <Badge
                variant="outline"
                className={`ml-auto ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty}
              </Badge>
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(question);
                  }}
                  aria-label="Edit question"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && question._id && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(question._id!);
                  }}
                  aria-label="Delete question"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-muted/20">
            <div className="prose dark:prose-invert max-w-none">
              <p>{question.answer}</p>
              {question.keywords && question.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {question.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="mr-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
