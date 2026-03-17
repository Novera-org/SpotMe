"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  id: string;
  name: string;
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export default function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder = "••••••••",
  minLength = 8,
  maxLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center w-full">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          /* Eye-off icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <path d="m2 2 20 20" />
          </svg>
        ) : (
          /* Eye icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
