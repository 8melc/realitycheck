// CompleteStep component - placeholder
export default function CompleteStep({ formData }: any) {
  return (
    <div className="complete-content">
      <h2>Onboarding Complete!</h2>
      <p>Welcome to FYF, {formData.name}!</p>
    </div>
  );
}
