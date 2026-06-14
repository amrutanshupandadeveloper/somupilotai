import { Link } from "react-router-dom";

function AuthForm({
  title,
  subtitle,
  fields,
  formData,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
  alternateText,
  alternateTo,
  alternateLabel,
}) {
  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-glow backdrop-blur">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-300">
          SomuPilot AI
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              {field.label}
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-400/20"
              name={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={onChange}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              required={field.required}
            />
          </label>
        ))}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {alternateText}{" "}
        <Link to={alternateTo} className="font-medium text-sky-300 hover:text-sky-200">
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;
