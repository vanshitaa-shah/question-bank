"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DifficultyFilter = "all" | "easy" | "moderate" | "hard";

interface QuestionFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (difficulty: DifficultyFilter) => void;
}

export default function QuestionFilters({
  searchQuery,
  setSearchQuery,
  difficultyFilter,
  setDifficultyFilter,
}: QuestionFiltersProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Search questions..."
        className="max-w-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Select
        value={difficultyFilter}
        onValueChange={(value) =>
          setDifficultyFilter(value as DifficultyFilter)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
