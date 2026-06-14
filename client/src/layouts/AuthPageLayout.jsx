function AuthPageLayout({ children }) {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_28%)]" />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

export default AuthPageLayout;
