import { getQuestions } from "@/app/actions/questionActions";
import { Topic } from "@/models/topic";
import { connectDB } from "@/lib/db";
import QuestionsClient from "@/components/Questions/QuestionsClient";
import type { Metadata } from "next";

interface QuestionsPageProps {
  searchParams: Promise<{
    topicId?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Questions | Question Bank",
  description: "View and filter questions for your selected topic.",
};

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  // Await the searchParams promise
  const params = await searchParams;
  const topicId = params.topicId || "";

  console.log("Topic ID:", topicId);

  if (!topicId) {
    return <div className="p-6">No topic selected. Please select a topic.</div>;
  }

  // Fetch data on the server using the question action
  await connectDB();
  const questions = await getQuestions(topicId);

  console.log("Fetched questions:", questions);

  // Get topic name
  const topic = await Topic.findById(topicId);
  const topicName = topic ? topic.name : "Unknown Topic";
  console.log("Topic Name:", topicName);

  return (
    <QuestionsClient
      initialQuestions={[...questions]}
      topicId={topicId}
      topicName={topicName}
    />
  );
}
