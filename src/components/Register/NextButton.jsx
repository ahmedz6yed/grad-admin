import { ArrowRight } from "lucide-react";

export default function NextButton({ onClick, text = "Continue" }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-cream bg-accent hover:bg-accent-hover rounded-lg transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
    >
      {text}
      <ArrowRight size={18} />
    </button>
  );
}
