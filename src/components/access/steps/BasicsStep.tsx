// BasicsStep component - placeholder
export default function BasicsStep({ formData, updateFormData }: any) {
  return (
    <div className="form-content">
      <div className="form-group">
        <label>Name</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => updateFormData({ name: e.target.value })}
        />
      </div>
    </div>
  );
}
