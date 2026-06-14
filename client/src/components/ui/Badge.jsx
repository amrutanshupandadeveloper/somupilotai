export function Badge({ variant = "default", children, className = "" }) {
  const variants = {
    default: "bg-slate-400/10 text-slate-300",
    success: "bg-green-400/10 text-green-300",
    warning: "bg-yellow-400/10 text-yellow-300",
    danger: "bg-red-400/10 text-red-300",
    info: "bg-sky-400/10 text-sky-300",
    purple: "bg-purple-400/10 text-purple-300",
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
