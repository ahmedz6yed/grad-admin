import Logo from "../ui/Logo.jsx";
import StepsList from "./StepsList.jsx";
import { useStepStore } from "../../store/useStepStore.js";
import { useNavigate } from "react-router-dom";

export default function RegisterSidebar() {
  const currentStep = useStepStore((state) => state.step);
  const navigate = useNavigate();
  function accountExist() {
    navigate("/login");
  }
  return (
    <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col bg-surface p-8 lg:p-10 h-full overflow-y-auto border-r border-border">
      <div className="mb-8">
        <header className="hidden   lg:flex items-center justify-between p-4 sm:px-8 sm:py-6 ">
          <Logo className="text-4xl" />
        </header>
      </div>

      <StepsList currentStep={currentStep} />

      <div className="mt-12">
        {currentStep == 1 && (
          <button
            onClick={accountExist}
            className="cursor-pointer w-full btn-ghost py-3 font-sans font-medium text-sm rounded-lg border-border hover:bg-card-hover transition-colors"
          >
            Already have an account?
          </button>
        )}
      </div>
    </aside>
  );
}
