import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  await connectDB();
  const topics = await Topic.find();
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { name } = await req.json();
  const topic = await Topic.create({ name, questions: [] });
  return NextResponse.json(topic, { status: 201 });
}
