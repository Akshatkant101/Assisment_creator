"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.back()} 
      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>
  );
}
