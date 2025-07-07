// app/api/topics/[topicId]/questions/[questionId]/route.ts
import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ topicId: string; questionId: string }> }
) {
  const params = await props.params;
  await connectDB();
  const { topicId, questionId } = params;
  const updates = await req.json();

  const topic = await Topic.findById(topicId);
  if (!topic)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const question = topic.questions.id(questionId);
  if (!question)
    return NextResponse.json({ error: "Question not found" }, { status: 404 });

  Object.assign(question, updates);
  await topic.save();

  return NextResponse.json({ message: "Question updated", question });
}


export async function DELETE(
  _: NextRequest,
  props: { params: Promise<{ topicId: string; questionId: string }> }
) {
  const params = await props.params;
  await connectDB();
  const { topicId, questionId } = params;

  const topic = await Topic.findById(topicId);
  if (!topic)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const question = topic.questions.id(questionId);
  if (!question)
    return NextResponse.json({ error: "Question not found" }, { status: 404 });

  topic.questions.pull({ _id: questionId });
  await topic.save();

  return NextResponse.json({ message: "Question deleted successfully" });
}
  