import Link from "next/link";

const demoFilePath =
  "/demo/Pediatric%20Surgery%20Hub%20%C2%B7%20Demo%20m%C3%B3vil.html";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4 sm:min-h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-text-main">Demo móvil</h1>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
          >
            Volver a casos
          </Link>
        </div>

        <iframe
          title="Pediatric Surgery Hub - Demo móvil"
          src={demoFilePath}
          className="min-h-0 flex-1 rounded-xl border border-card-border bg-white shadow-extruded-md"
        />
      </div>
    </main>
  );
}
