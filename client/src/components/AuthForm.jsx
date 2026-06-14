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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
      <div className="hidden rounded-[36px] border border-[var(--border)] bg-white/5 p-10 backdrop-blur-xl lg:block">
        <p className="app-kicker">SomuPilot AI</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text)]">
          Your personal AI workspace, designed for calm focus.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-muted)]">
          Keep chats, notes, tasks, memories, and documents in one polished command
          center. Secure sign-in unlocks your full assistant experience.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {["Guided chat", "Smart memory", "Task planning", "Document Q&A"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-4 text-sm text-[var(--text-soft)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="app-gradient-border app-card mx-auto w-full max-w-md rounded-[32px] p-8 sm:p-9">
        <div className="mb-8">
          <p className="app-kicker">SomuPilot AI</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                {field.label}
              </span>
              <input
                className="app-input"
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
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3.5 font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {alternateText}{" "}
          <Link
            to={alternateTo}
            className="font-medium text-[var(--accent)] transition hover:brightness-110"
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
