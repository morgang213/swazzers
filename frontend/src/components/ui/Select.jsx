export default function Select({ 
  label, 
  error, 
  children,
  className,
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
          error ? 'border-status-critical' : 'border-gray-300'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-status-critical">{error}</p>
      )}
    </div>
  );
}
