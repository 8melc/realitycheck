// StepHeader component - placeholder
export default function StepHeader({ step, formData, showGoalBadge }: any) {
  return (
    <div className="step-header">
      <h1 className="step-title">{step.heading}</h1>
      <p className="step-subtitle">{step.microcopy}</p>
    </div>
  );
}
