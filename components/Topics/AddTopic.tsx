'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../SubmitButton';
import { createTopic } from '@/app/actions/topicActions';

interface AddOrEditTopicModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialName?: string;
  onSubmit?: (name: string) => Promise<void>;
  loading?: boolean;
  mode?: 'add' | 'edit';
}

export function AddOrEditTopicModal({
  open,
  setOpen,
  initialName = '',
  onSubmit,
  loading = false,
  mode = 'add',
}: AddOrEditTopicModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  // Reset name when modal opens/closes or initialName changes
  useEffect(() => {
    setName(initialName);
    setError(null);
  }, [open, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (onSubmit) {
        await onSubmit(name.trim());
        setOpen(false);
      } else if (mode === 'add') {
        await createTopic(name.trim());
        setOpen(false);
      } else if (mode === 'edit') {
        // Should not happen, but fallback
        setOpen(false);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save topic');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Enter topic name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <SubmitButton type="submit" disabled={loading}>
            {loading ? (mode === 'edit' ? 'Saving...' : 'Adding...') : mode === 'edit' ? 'Save Changes' : 'Add'}
          </SubmitButton>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Backwards compatibility: default export is add button with modal
export default function AddTopicModalButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary text-white">
        ➕ Add Topic
      </Button>
      <AddOrEditTopicModal open={open} setOpen={setOpen} mode="add" />
    </>
  );
}
