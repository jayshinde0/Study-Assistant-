export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
    <input 
      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 bg-white placeholder-gray-400 text-gray-900" 
      {...props} 
    />
    {error && <p className="text-red-500 text-sm mt-1 font-medium">❌ {error}</p>}
  </div>
);
