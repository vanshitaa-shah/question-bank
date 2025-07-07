"use server";

import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { revalidatePath } from "next/cache";

export async function getAllTopics() {
  await connectDB();
  const topics = await Topic.find();
  return JSON.parse(JSON.stringify(topics));
}

export async function getTopicById(id: string) {
  await connectDB();
  const topic = await Topic.findById(id);
  return JSON.parse(JSON.stringify(topic));
}

export async function createTopic(name: string) {
  await connectDB();
  const exists = await Topic.findOne({ name });
  if (exists) {
    throw new Error("Topic name must be unique");
  }
  const newTopic = await Topic.create({ name, questions: [] });
  revalidatePath("/topics");

  return JSON.parse(JSON.stringify(newTopic));
}

export async function updateTopic(id: string, name: string) {
  await connectDB();
  const exists = await Topic.findOne({ name, _id: { $ne: id } });
  if (exists) {
    throw new Error("Topic name must be unique");
  }
  const updated = await Topic.findByIdAndUpdate(id, { name }, { new: true });
  revalidatePath("/topics");
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteTopic(id: string) {
  await connectDB();
  await Topic.findByIdAndDelete(id);
  revalidatePath("/topics");
}
