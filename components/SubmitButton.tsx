import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import React from "react";
import { InlineLoader } from "@/components/ui/loader";

interface SubmitButtonProps {
  children?: React.ReactNode;
  className?: string;
  pendingText?: string;
}

export default function SubmitButton({
  children = "Submit",
  className = "",
  pendingText = "Submitting...",
  ...props
}: SubmitButtonProps & React.ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={`${className}`} disabled={pending} {...props}>
      {pending ? <InlineLoader text={pendingText} /> : children}
    </Button>
  );
}
