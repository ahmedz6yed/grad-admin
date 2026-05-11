export default function PaginationDots({ currentStep = 1, totalSteps = 4 }) {
  return (
    <div className="flex gap-2 items-center absolute left-1/2 -translate-x-1/2">
      {[...Array(totalSteps)].map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={index}
            className={`transition-all duration-300 rounded-full ${
              isActive ? "w-6 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}
