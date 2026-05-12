'use client';

/**
 * ProgressSteps - Visual step indicator for multi-step flows
 * @param {number} currentStep - Current active step (1-indexed)
 * @param {number} totalSteps - Total number of steps
 */
export function ProgressSteps({ currentStep, totalSteps }) {
  return (
    <div className="flex gap-2 mt-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepIndex = i + 1;
        let className = 'step-dot';
        if (stepIndex < currentStep) className += ' completed';
        else if (stepIndex === currentStep) className += ' active';
        
        return (
          <div
            key={stepIndex}
            className={className}
            aria-label={`Bước ${stepIndex} / ${totalSteps}`}
          />
        );
      })}
    </div>
  );
}
