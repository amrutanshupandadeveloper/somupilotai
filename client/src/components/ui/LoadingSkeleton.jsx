export function LoadingSkeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full max-w-2xl space-y-3">
        <LoadingSkeleton className="h-3 w-28 rounded-full" />
        <LoadingSkeleton className="h-9 w-72 rounded-2xl" />
        <LoadingSkeleton className="h-4 w-full max-w-xl rounded-xl" />
      </div>
      <LoadingSkeleton className="h-11 w-36 rounded-2xl" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="app-card rounded-[28px] p-6">
      <LoadingSkeleton className="h-4 w-1/3 mb-4 rounded" />
      <LoadingSkeleton className="h-3 w-full mb-2 rounded" />
      <LoadingSkeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full space-y-3">
              <LoadingSkeleton className="h-4 w-24 rounded-xl" />
              <LoadingSkeleton className="h-9 w-20 rounded-2xl" />
              <LoadingSkeleton className="h-3 w-28 rounded-xl" />
            </div>
            <LoadingSkeleton className="h-10 w-10 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DirectorySkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <LoadingSkeleton className="h-5 w-36 rounded-xl" />
                <LoadingSkeleton className="h-5 w-16 rounded-full" />
                <LoadingSkeleton className="h-5 w-20 rounded-full" />
              </div>
              <LoadingSkeleton className="mt-3 h-4 w-56 rounded-xl" />
              <div className="mt-4 flex flex-wrap gap-3">
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-40 rounded-xl" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-24 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuditLogSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <LoadingSkeleton className="h-4 w-36 rounded-xl" />
            <LoadingSkeleton className="h-5 w-20 rounded-full" />
          </div>
          <LoadingSkeleton className="mt-3 h-3 w-52 rounded-xl" />
          <LoadingSkeleton className="mt-2 h-3 w-40 rounded-xl" />
          <div className="mt-4 rounded-2xl border border-[var(--border)] p-3">
            <LoadingSkeleton className="h-3 w-full rounded-xl" />
            <LoadingSkeleton className="mt-2 h-3 w-11/12 rounded-xl" />
            <LoadingSkeleton className="mt-2 h-3 w-4/5 rounded-xl" />
          </div>
          <LoadingSkeleton className="mt-4 h-3 w-32 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%)]" />
      <div className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-5xl justify-center">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center">
            <div className="hidden space-y-6 lg:block">
              <div>
                <LoadingSkeleton className="h-3 w-32 rounded-full" />
                <div className="mt-4 space-y-3">
                  <LoadingSkeleton className="h-12 w-full max-w-2xl rounded-3xl" />
                  <LoadingSkeleton className="h-12 w-full max-w-xl rounded-3xl" />
                </div>
                <div className="mt-4 max-w-xl space-y-3">
                  <LoadingSkeleton className="h-4 w-full rounded-xl" />
                  <LoadingSkeleton className="h-4 w-11/12 rounded-xl" />
                  <LoadingSkeleton className="h-4 w-5/6 rounded-xl" />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/40 shadow-[0_20px_50px_rgba(20,184,166,0.12)] backdrop-blur-xl overflow-hidden flex flex-col h-[350px] w-full">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/2 px-5 py-3">
                  <div className="flex gap-2">
                    <LoadingSkeleton className="h-2.5 w-2.5 rounded-full" />
                    <LoadingSkeleton className="h-2.5 w-2.5 rounded-full" />
                    <LoadingSkeleton className="h-2.5 w-2.5 rounded-full" />
                  </div>
                  <LoadingSkeleton className="h-3 w-36 rounded-full" />
                  <div className="w-10" />
                </div>

                <div className="flex-1 space-y-4 p-5">
                  <div className="ml-auto w-[85%] rounded-2xl bg-[var(--accent-soft)] px-4 py-3">
                    <LoadingSkeleton className="h-3 w-10 rounded-full bg-black/10" />
                    <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl bg-black/10" />
                    <LoadingSkeleton className="mt-2 h-4 w-4/5 rounded-xl bg-black/10" />
                  </div>
                  <div className="w-[88%] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <LoadingSkeleton className="h-3 w-24 rounded-full" />
                    <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
                    <LoadingSkeleton className="mt-2 h-4 w-5/6 rounded-xl" />
                    <LoadingSkeleton className="mt-2 h-4 w-3/4 rounded-xl" />
                  </div>
                  <div className="ml-auto w-[80%] rounded-2xl bg-[var(--accent-soft)] px-4 py-3">
                    <LoadingSkeleton className="h-3 w-10 rounded-full bg-black/10" />
                    <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl bg-black/10" />
                    <LoadingSkeleton className="mt-2 h-4 w-4/5 rounded-xl bg-black/10" />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/5 bg-white/2 p-3">
                  <LoadingSkeleton className="h-8 flex-1 rounded-full" />
                  <LoadingSkeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>

            <div className="app-gradient-border app-card mx-auto w-full max-w-md rounded-[32px] p-8 relative overflow-hidden sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/10 blur-[60px]" />
              <div className="relative z-10 mb-8">
                <LoadingSkeleton className="h-3 w-28 rounded-full" />
                <LoadingSkeleton className="mt-4 h-9 w-48 rounded-2xl" />
                <div className="mt-3 space-y-2">
                  <LoadingSkeleton className="h-4 w-full rounded-xl" />
                  <LoadingSkeleton className="h-4 w-4/5 rounded-xl" />
                </div>
              </div>

              <div className="relative z-10 space-y-5">
                <div>
                  <LoadingSkeleton className="mb-2 h-4 w-16 rounded-xl" />
                  <LoadingSkeleton className="h-12 w-full rounded-2xl" />
                </div>
                <div>
                  <LoadingSkeleton className="mb-2 h-4 w-20 rounded-xl" />
                  <LoadingSkeleton className="h-12 w-full rounded-2xl" />
                </div>
                <LoadingSkeleton className="h-14 w-full rounded-2xl" />
              </div>

              <div className="relative z-10 mt-6 flex justify-center">
                <LoadingSkeleton className="h-4 w-44 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardShellSkeleton() {
  return (
    <div className="app-shell flex h-screen overflow-hidden bg-black">
      <div className="mx-auto flex h-full w-full max-w-[1720px]">
        <aside className="hidden h-full w-[288px] shrink-0 border-r border-[var(--border)] bg-[color:var(--sidebar)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="shrink-0 border-b border-[var(--border)] px-4 py-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <LoadingSkeleton className="h-6 w-36 rounded-xl" />
                <LoadingSkeleton className="ml-8 mt-2 h-3 w-24 rounded-xl" />
              </div>
              <LoadingSkeleton className="h-10 w-10 rounded-2xl" />
            </div>
          </div>

          <div className="flex-1 min-h-0 px-4 py-4">
            <LoadingSkeleton className="mb-6 h-12 w-full rounded-2xl" />
            <LoadingSkeleton className="mb-6 h-[66px] w-full rounded-xl" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-11 w-full rounded-xl" />
              <LoadingSkeleton className="h-11 w-full rounded-xl" />
              <LoadingSkeleton className="h-11 w-full rounded-xl" />
              <LoadingSkeleton className="h-11 w-full rounded-xl" />
              <LoadingSkeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-3">
              <LoadingSkeleton className="h-4 w-24 rounded-xl" />
              <LoadingSkeleton className="h-16 w-full rounded-2xl" />
              <LoadingSkeleton className="h-16 w-full rounded-2xl" />
              <LoadingSkeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>

          <div className="shrink-0 border-t border-[var(--border)] px-4 pb-5 pt-4">
            <LoadingSkeleton className="h-16 w-full rounded-2xl" />
          </div>
        </aside>

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <header
            className="sticky top-0 z-30 border-b border-[var(--border)]"
            style={{ backgroundColor: "var(--sidebar)" }}
          >
            <div className="flex min-h-[52px] items-center justify-between gap-4 px-4 py-2 sm:px-6 xl:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <LoadingSkeleton className="h-9 w-16 rounded-2xl lg:hidden" />
                <div className="min-w-0 space-y-1">
                  <LoadingSkeleton className="h-4 w-36 rounded-xl" />
                  <LoadingSkeleton className="h-3 w-20 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LoadingSkeleton className="hidden h-10 w-28 rounded-2xl sm:block" />
                <LoadingSkeleton className="h-10 w-10 rounded-2xl" />
                <LoadingSkeleton className="h-10 w-10 rounded-2xl" />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 xl:px-8">
            <div className="space-y-8">
              <PageHeaderSkeleton />

              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
                <div className="app-gradient-border app-card rounded-[32px] p-6 sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-3">
                      <LoadingSkeleton className="h-3 w-28 rounded-full" />
                      <LoadingSkeleton className="h-10 w-full max-w-xl rounded-2xl" />
                      <LoadingSkeleton className="h-4 w-full max-w-2xl rounded-xl" />
                      <LoadingSkeleton className="h-4 w-5/6 max-w-xl rounded-xl" />
                    </div>
                    <LoadingSkeleton className="h-12 w-32 rounded-2xl" />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="rounded-[26px] border border-[var(--border)] bg-white/5 p-4">
                        <LoadingSkeleton className="h-5 w-28 rounded-xl" />
                        <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
                        <LoadingSkeleton className="mt-2 h-4 w-5/6 rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-card rounded-[28px] p-6">
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <LoadingSkeleton className="h-4 w-24 rounded-xl" />
                          <LoadingSkeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <LoadingSkeleton className="h-2 w-full rounded-full" />
                        <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                        <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                        <LoadingSkeleton className="mt-3 h-8 w-16 rounded-2xl" />
                      </div>
                      <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                        <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                        <LoadingSkeleton className="mt-3 h-8 w-20 rounded-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <StatGridSkeleton count={6} />

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="app-card rounded-[28px] p-6">
                  <ListSkeleton count={3} />
                </div>
                <div className="app-card rounded-[28px] p-6">
                  <ListSkeleton count={3} />
                </div>
                <div className="app-card rounded-[28px] p-6">
                  <ListSkeleton count={3} />
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
