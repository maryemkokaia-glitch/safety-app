import { LogoFull } from "@/components/ui/logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8 px-5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <LogoFull size="sm" />
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Sarke.{" "}
          <a
            href="https://matsne.gov.ge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            matsne.gov.ge
          </a>
        </p>
      </div>
    </footer>
  );
}
