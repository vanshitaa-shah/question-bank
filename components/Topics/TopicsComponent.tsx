"use client";
import { useState, useTransition } from "react";
import { searchTopics } from "@/app/actions/topicSearchActions";
import {
  deleteTopic,
  updateTopic,
  createTopic,
} from "@/app/actions/topicActions";
import { AddOrEditTopicModal } from "@/components/Topics/AddTopic";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TopicType } from "@/types";
import SearchInput from "@/components/Topics/SearchInput";
import TopicCard from "@/components/Topics/TopicCard";
import { Button } from "../ui/button";

function isTopicWithId(topic: TopicType): topic is TopicType & { _id: string } {
  return typeof topic._id === "string";
}

export default function TopicsClient({
  initialTopics,
}: {
  initialTopics: TopicType[];
}) {
  const [search, setSearch] = useState("");
  const [filteredTopics, setFilteredTopics] =
    useState<TopicType[]>(initialTopics);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    topicId: string | null;
  }>({ open: false, topicId: null });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editInitialName, setEditInitialName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  async function handleDelete(id: string) {
    setError(null);
    startTransition(() => {
      (async () => {
        try {
          await deleteTopic(id);
          setFilteredTopics((topics: TopicType[]) =>
            topics.filter((t) => t._id !== id)
          );
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })();
    });
  }

  async function handleEdit(id: string, name: string) {
    setEditId(id);
    setEditInitialName(name);
    setEditModalOpen(true);
  }

  async function handleEditSubmit(name: string) {
    if (!editId) return;
    setError(null);
    setEditLoading(true);
    // Optimistic update
    const prevTopics = filteredTopics;
    setFilteredTopics((topics: TopicType[]) =>
      topics.map((t) => (t._id === editId ? { ...t, name } : t))
    );
    startTransition(() => {
      (async () => {
        try {
          const topic: TopicType = await updateTopic(editId, name);
          if (isTopicWithId(topic)) {
            setFilteredTopics((topics: TopicType[]) =>
              topics.map((t) => (t._id === topic._id ? topic : t))
            );
          }
          setEditModalOpen(false);
          setEditId(null);
        } catch (err: unknown) {
          setFilteredTopics(prevTopics); // Rollback on error
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setEditLoading(false);
        }
      })();
    });
  }

  async function handleAddSubmit(name: string) {
    setError(null);
    setAddLoading(true);
    // Optimistic update
    const prevTopics = filteredTopics;
    const tempId = Math.random().toString(36).slice(2);
    setFilteredTopics((topics: TopicType[]) => [
      { _id: tempId, name, questions: [] },
      ...topics,
    ]);
    setAddModalOpen(false);
    startTransition(() => {
      (async () => {
        try {
          const topic: TopicType = await createTopic(name);
          if (isTopicWithId(topic)) {
            setFilteredTopics((topics: TopicType[]) =>
              topics.map((t) => (t._id === tempId ? topic : t))
            );
          }
        } catch (err: unknown) {
          setFilteredTopics(prevTopics); // Rollback on error
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setAddLoading(false);
        }
      })();
    });
  }

  async function handleSearch(query: string) {
    setSearch(query);
    const topics = await searchTopics(query);
    setFilteredTopics(topics);
  }

  const handleDeleteRequest = (id: string) => {
    setConfirmDialog({ open: true, topicId: id });
  };
  const handleDeleteConfirm = async () => {
    if (confirmDialog.topicId) {
      await handleDelete(confirmDialog.topicId);
    }
    setConfirmDialog({ open: false, topicId: null });
  };

  return (
    <>
      {/* Add Topic Modal (reused) */}
      <AddOrEditTopicModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        onSubmit={handleAddSubmit}
        loading={addLoading}
        mode="add"
      />
      <div className="flex justify-between">
        <SearchInput value={search} onChange={handleSearch} />

        <Button onClick={() => setAddModalOpen(true)} className="">
          ➕ Add Topic
        </Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredTopics.map((topic) =>
          isTopicWithId(topic) ? (
            <TopicCard
              key={topic._id}
              topic={topic}
              onDelete={() => handleDeleteRequest(topic._id)}
              onEdit={handleEdit}
            />
          ) : null
        )}
      </div>
      {/* Edit Topic Modal (reused) */}
      <AddOrEditTopicModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        initialName={editInitialName}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        mode="edit"
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({
            open,
            topicId: open ? confirmDialog.topicId : null,
          })
        }
        title="Delete Topic"
        description="Are you sure you want to delete this topic? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ open: false, topicId: null })}
      />
    </>
  );
}
