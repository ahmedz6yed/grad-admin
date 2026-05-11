import { Outlet, useNavigate } from "react-router-dom";
import PaginationDots from "../ui/PaginationDots.jsx";
import { useStepStore } from "../../store/useStepStore.js";
import { steps } from "../../data/StepsList.js";
import { RotateCcw } from "lucide-react";

export default function RegisterContent() {
  const currentStep = useStepStore((state) => state.step);
  const reset = useStepStore((state) => state.reset);
  const totalSteps = steps.length;
  const navigate = useNavigate();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your registration progress? This will clear all entered data.")) {
      reset();
      navigate("/register");
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-page p-8 lg:p-10 h-full overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full my-auto py-8">
        <Outlet />
      </div>

      {/* Footer Elements */}
      <div className="mt-8 flex items-center justify-between w-full relative">
        <div className="flex-1">
          <button
            onClick={handleReset}
            className="text-[10px] font-bold text-muted hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5 group"
            title="Reset all registration progress"
          >
            <RotateCcw
              size={12}
              className="group-hover:rotate-[-45deg] transition-transform duration-300"
            />
            Reset Progress
          </button>
        </div>

        {/* Pagination Dots */}
        <PaginationDots currentStep={currentStep} totalSteps={totalSteps} />
      </div>
    </div>
  );
}
