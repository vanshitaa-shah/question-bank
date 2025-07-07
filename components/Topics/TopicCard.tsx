"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { TopicType } from "@/types";

export default function TopicCard({
  topic,
  onDelete,
  onEdit,
}: {
  topic: TopicType;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const topicId = topic._id ?? "";

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            if (topicId) onEdit(topicId, topic.name);
          }}
          aria-label="Edit topic"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900"
          onClick={(e) => {
            e.stopPropagation();
            if (topicId) startTransition(() => onDelete(topicId));
          }}
          disabled={isPending || !topicId}
          aria-label="Delete topic"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Link href={`/questions?topicId=${topicId}`} passHref>
        <CardContent className="p-6 flex flex-col items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-medium">{topic.name}</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Click to view questions
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
