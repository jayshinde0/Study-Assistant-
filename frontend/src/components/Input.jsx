export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium mb-2">{label}</label>}
    <input className="input-field" {...props} />
    {error && <p className="text-error text-sm mt-1">{error}</p>}
  </div>
);
