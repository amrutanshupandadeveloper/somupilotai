function AuthPageLayout({ children }) {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%)]" />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

export default AuthPageLayout;
