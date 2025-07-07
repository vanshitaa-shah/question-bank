import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  props: { params: Promise<{ topicId: string }> }
) {
  const params = await props.params;
  await connectDB();
  const topic = await Topic.findById(params.topicId);
  return NextResponse.json(topic);
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ topicId: string }> }
) {
  const params = await props.params;
  console.log("Updating topic with ID:", params);

  await connectDB();
  const { name } = await req.json();
  const updated = await Topic.findByIdAndUpdate(
    params.topicId,
    { name },
    { new: true }
  );
  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  props: { params: Promise<{ topicId: string }> }
) {
  const params = await props.params;
  await connectDB();
  await Topic.findByIdAndDelete(params.topicId);
  return NextResponse.json({ message: "Deleted successfully" });
}
