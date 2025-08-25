"use server";

import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";
import { revalidatePath } from "next/cache";

export async function getAllTopics() {
  try {
    await connectDB();
    const topics = await Topic.find().maxTimeMS(15000); // 15 second timeout
    return JSON.parse(JSON.stringify(topics));
  } catch (error) {
    console.error("Error getting topics:", error);
    throw new Error("Failed to fetch topics");
  }
}

export async function getTopicById(id: string) {
  try {
    await connectDB();
    const topic = await Topic.findById(id).maxTimeMS(15000);
    return JSON.parse(JSON.stringify(topic));
  } catch (error) {
    console.error("Error getting topic:", error);
    throw new Error("Failed to fetch topic");
  }
}

export async function createTopic(name: string) {
  try {
    await connectDB();
    const exists = await Topic.findOne({ name }).maxTimeMS(15000);
    if (exists) {
      throw new Error("Topic name must be unique");
    }
    const newTopic = await Topic.create({ name, questions: [] });
    revalidatePath("/topics");
    return JSON.parse(JSON.stringify(newTopic));
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
}

export async function updateTopic(id: string, name: string) {
  try {
    await connectDB();
    const exists = await Topic.findOne({ name, _id: { $ne: id } }).maxTimeMS(15000);
    if (exists) {
      throw new Error("Topic name must be unique");
    }
    const updated = await Topic.findByIdAndUpdate(id, { name }, { new: true }).maxTimeMS(15000);
    revalidatePath("/topics");
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating topic:", error);
    throw error;
  }
}

export async function deleteTopic(id: string) {
  try {
    await connectDB();
    await Topic.findByIdAndDelete(id).maxTimeMS(15000);
    revalidatePath("/topics");
  } catch (error) {
    console.error("Error deleting topic:", error);
    throw new Error("Failed to delete topic");
  }
}
