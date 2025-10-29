// ProgressBar component - placeholder
export default function ProgressBar({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">
        Schritt {currentStep + 1} von {totalSteps}
      </div>
    </div>
  );
}
