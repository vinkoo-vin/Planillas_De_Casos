import Link from "next/link";

const demoFilePath =
  "/demo/Pediatric%20Surgery%20Hub%20%C2%B7%20Demo%20m%C3%B3vil.html";

export default function DemoPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-bg">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg shadow-lg transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Volver a casos
      </Link>
      <iframe
        title="Pediatric Surgery Hub - Demo móvil"
        src={demoFilePath}
        className="block h-full w-full border-0"
      />
    </main>
  );
}
