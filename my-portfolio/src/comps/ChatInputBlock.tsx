"use client";
import { useRef, useState, useEffect } from "react";

interface ChatInputBlockProps {
  onSend: (message: string) => void;  // expects a string
  loading: boolean;                   // loading state
}

export default function ChatInputBlock({ onSend, loading }: ChatInputBlockProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);



  // optional: prevent wheel/arrow scroll while input focused
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;

    const preventWheel = (e: WheelEvent) => {
      if (document.activeElement === ta) e.preventDefault();
    };
    const preventArrowScroll = (e: KeyboardEvent) => {
      if (
        document.activeElement === ta &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault();
      }
    };

    const handleFocus = () => {
      window.addEventListener("wheel", preventWheel, { passive: false });
      window.addEventListener("keydown", preventArrowScroll);
    };
    const handleBlur = () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("keydown", preventArrowScroll);
    };

    ta.addEventListener("focus", handleFocus);
    ta.addEventListener("blur", handleBlur);

    return () => {
      ta.removeEventListener("focus", handleFocus);
      ta.removeEventListener("blur", handleBlur);
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("keydown", preventArrowScroll);
    };
  }, []);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const toSend = prompt;
    setPrompt("");

    try {
      inputRef.current?.focus({ preventScroll: true });
    } catch {
      inputRef.current?.focus();
    }

    onSend(toSend); // calls parent’s sendPrompt
  };

  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-white/20 p-4 flex space-x-3 bg-white/40 backdrop-blur-md rounded-b-2xl">
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your message..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="flex-1 border border-white/20 rounded-xl px-4 py-2 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80 resize-none transition"
      />

<button
  type="button"
  onClick={handleSend}
  disabled={loading}
  className="px-4 py-2 rounded-2xl font-semibold 
             bg-gradient-to-r from-cyan-500 to-blue-600 
             text-white shadow-md 
             hover:shadow-lg hover:scale-105 
             transition-transform disabled:opacity-40"
>
  {loading ? "Sending…" : "Send"}
</button>

    </div>
  );
}
