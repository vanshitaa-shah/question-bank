// import { getAllTopics } from "@/app/actions/topicActions";
// import TopicsClient from "@/components/Topics/TopicsComponent";
// import { use } from "react";
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Topics | Question Bank",
//   description: "Browse and manage all your question topics.",
// };

// export default function TopicsPage() {
//   // Use the new use() API for server data fetching
//   const topics = use(getAllTopics());
//   return <TopicsClient initialTopics={topics} />;
// }

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import TopicsListServerWrapper from "@/components/Topics/TopicsListServerWrapper";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Topics | Question Bank",
  description: "Browse and manage all your question topics.",
};

export default function TopicsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="📚 Topics" />
      <Suspense
        fallback={
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <h1>Loading</h1>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <TopicsListServerWrapper />
      </Suspense>
    </div>
  );
}