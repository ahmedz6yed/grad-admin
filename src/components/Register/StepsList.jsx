import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { steps } from "../../data/StepsList.js";

export default function StepsList({ currentStep = 1 }) {
  return (
    <div className="flex-1 relative">
      <ul className="flex flex-col gap-8 relative z-10">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <li key={index} className="flex gap-4 items-start relative">
              {/* Connecting Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="absolute left-[11px] top-7 bottom-[-2rem] w-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`w-full bg-accent transition-all duration-700 ease-out ${isCompleted ? "h-full" : "h-0"}`}
                  />
                </div>
              )}

              <div className="mt-0.5 relative z-10 bg-surface flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2
                    size={24}
                    className="text-accent transition-all duration-500 scale-100"
                  />
                ) : isActive ? (
                  <div className="relative">
                    <CircleDot
                      size={24}
                      className="text-accent transition-all duration-500 scale-110"
                    />
                    <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-75"></div>
                  </div>
                ) : (
                  <Circle
                    size={24}
                    className="text-border transition-all duration-500 scale-95"
                  />
                )}
              </div>
              <div
                className={`flex flex-col transition-all duration-500 ease-out ${isActive ? "translate-x-1" : ""}`}
              >
                <span
                  className={`font-sans font-medium transition-colors duration-500 ${
                    isActive
                      ? "text-accent"
                      : isCompleted
                        ? "text-text"
                        : "text-text-muted/60"
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`font-sans text-sm transition-colors duration-500 mt-0.5 ${
                    isActive ? "text-text-muted" : "text-text-subtle/60"
                  }`}
                >
                  {step.description}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
