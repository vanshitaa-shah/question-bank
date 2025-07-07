import { getAllTopics } from "@/app/actions/topicActions";
import { use } from "react";
import TopicsClient from "@/components/Topics/TopicsComponent";

export default function TopicsListServerWrapper() {
  const topics = use(getAllTopics());
  return <TopicsClient initialTopics={topics} />;
}
