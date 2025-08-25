"use client";

import React, { useState, useEffect } from "react";
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
import { Question } from "@/types";
import { InlineLoader } from "@/components/ui/loader";

interface QuestionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (questionData: Omit<Question, "_id">) => Promise<void>;
  isPending: boolean;
  initialValues?: Partial<Omit<Question, "_id">>;
  mode?: "add" | "edit";
}

export default function QuestionModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  initialValues = {},
  mode = "add",
}: QuestionModalProps) {
  const [questionText, setQuestionText] = useState(initialValues.question || "");
  const [answerText, setAnswerText] = useState(initialValues.answer || "");
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">(
    initialValues.difficulty || "moderate"
  );
  const [keywords, setKeywords] = useState(
    initialValues.keywords ? initialValues.keywords.join(", ") : ""
  );

  useEffect(() => {
    setQuestionText(initialValues.question || "");
    setAnswerText(initialValues.answer || "");
    setDifficulty(initialValues.difficulty || "moderate");
    setKeywords(initialValues.keywords ? initialValues.keywords.join(", ") : "");
  }, [initialValues, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const questionData: Omit<Question, "_id"> = {
      question: questionText,
      answer: answerText,
      difficulty,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
    };
    await onSubmit(questionData);
    // Reset only if adding
    if (mode === "add") {
      setQuestionText("");
      setAnswerText("");
      setDifficulty("moderate");
      setKeywords("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Question" : "Add New Question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Enter the answer"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={difficulty}
                onValueChange={(value) =>
                  setDifficulty(value as "easy" | "moderate" | "hard")
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="keywords">
                Keywords (optional, comma-separated)
              </Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. javascript, arrays, functions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <InlineLoader text={mode === "edit" ? "Saving..." : "Adding..."} /> : mode === "edit" ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
