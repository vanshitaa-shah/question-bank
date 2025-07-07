// components/search-input.tsx
"use client";

import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <div className="max-w-sm">
      <Input
        placeholder={placeholder ?? "Search..."}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
