export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-[380px]">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="
              grid
              size-11
              place-items-center
              rounded-md
              bg-accent
              text-base
              font-semibold
              text-accent-fg
              shadow-accent-sm
            "
          >
            K
          </div>

          <p className="font-display text-lg font-medium tracking-[-0.02em] text-fg">
            Kara
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
