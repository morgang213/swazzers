import clsx from 'clsx';

export default function Badge({ children, variant = 'info', className }) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    critical: 'bg-red-100 text-red-800',
    ok: 'bg-green-100 text-green-800',
    below_par: 'bg-amber-100 text-amber-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
