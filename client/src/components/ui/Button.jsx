export function Button({ variant = "primary", size = "md", children, className = "", ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-sky-400 text-slate-950 hover:bg-sky-400/90",
    secondary: "border border-sky-400/30 bg-sky-400/10 text-sky-300 hover:border-sky-400/50 hover:bg-sky-400/20",
    danger: "border border-red-400/30 bg-red-400/10 text-red-300 hover:border-red-400/50 hover:bg-red-400/20",
    ghost: "text-slate-300 hover:bg-white/5",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
