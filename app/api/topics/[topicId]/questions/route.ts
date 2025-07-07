// app/api/topics/[topicId]/questions/route.ts
import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, props: { params: Promise<{ topicId: string }> }) {
  const params = await props.params;
  await connectDB();
  const topicId = params.topicId;
  const { question, answer, difficulty, keywords } = await req.json();

  if (!question || !answer || !difficulty) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const topic = await Topic.findById(topicId);
  if (!topic)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  topic.questions.push({ question, answer, difficulty, keywords });
  await topic.save();

  return NextResponse.json(
    { message: "Question added successfully", topic },
    { status: 201 }
  );
}

export async function GET(_: NextRequest, props: { params: Promise<{ topicId: string }> }) {
  const params = await props.params;
  await connectDB();
  const topic = await Topic.findById(params.topicId);
  if (!topic)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  return NextResponse.json({ questions: topic.questions });
}

