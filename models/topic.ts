// models/Topic.ts

import mongoose, { Schema, Document } from "mongoose";

export interface Question {
  question: string;
  answer: string;
  difficulty: "easy" | "moderate" | "hard";
  keywords: string[];
  _id?: string;
}

export interface TopicDocument extends Document {
  name: string;
  questions: Question[];
}

const QuestionSchema = new Schema<Question>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      required: true,
    },
    keywords: [{ type: String }],
  },
  { timestamps: true }
);

const TopicSchema = new Schema<TopicDocument>(
  {
    name: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

export const Topic =
  mongoose.models.Topic || mongoose.model<TopicDocument>("Topic", TopicSchema);
