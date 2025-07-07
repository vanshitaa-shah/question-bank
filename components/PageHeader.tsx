import React from "react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, children, className }: PageHeaderProps) {
  return (
    <div className={`flex items-center gap-2 mb-4 sticky top-0 z-20 bg-background border-b py-4 px-2 ${className ?? ""}`.trim()} style={{ minHeight: 64 }}>
      <h1 className="text-2xl font-bold flex-1 truncate">{title}</h1>
      {children}
    </div>
  );
}
