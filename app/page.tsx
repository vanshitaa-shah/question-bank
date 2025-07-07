import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <Card className="w-full max-w-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">
          Welcome to Question Bank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Organize your learning with categorized topics and questions. Add
          topics, tag questions with difficulty and keywords, and search easily.
          It is simple, fast, and all in your browser for now!
        </p>
        <Link href="/topics" className="block">
          <Button
            size="lg"
            className="mt-4 w-full font-medium transition-all hover:shadow-sm group border-2 border-primary"
          >
            Start Adding Topics
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}