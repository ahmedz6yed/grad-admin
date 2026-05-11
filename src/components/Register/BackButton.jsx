import { ArrowLeft } from "lucide-react";

export default function BackButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-raised rounded-lg transition-colors cursor-pointer"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
