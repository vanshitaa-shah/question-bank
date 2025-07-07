"use server";
import { connectDB } from "@/lib/db";
import { Topic } from "@/models/topic";

export async function searchTopics(query: string) {
  await connectDB();

  try {
    if (!query) {
      const topics = await Topic.find().lean();
      return JSON.parse(JSON.stringify(topics));
    }

    console.log("Searching for topics with query:", query);
    const topics = await Topic.find({
      name: { $regex: query, $options: "i" },
    }).lean();
    return JSON.parse(JSON.stringify(topics));
  } catch (error) {
    console.error("Error searching topics:", error);
    return [];
  }
}
