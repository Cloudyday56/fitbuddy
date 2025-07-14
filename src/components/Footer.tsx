import { ZapIcon } from "lucide-react";
import Link from "next/link";

// ? just UI, could add some pages for the footer links later

const Footer = () => {
  return (
    <footer className="border-t border-border bg-[var(--footer-bg)] backdrop-blur-sm">
      {/* Top border glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded">
                <ZapIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xl font-bold font-mono">
                fit<span className="text-primary">buddy</span>.ai
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} fitbuddy.ai - All rights reserved
            </p>
          </div>

          {/* Status and GitHub Link */}
          <div className="flex items-center gap-4 px-3 py-2 ">
            <Link
              href="https://github.com/Cloudyday56/fitbuddy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/github-mark-white.svg"
                alt="GitHub Repo"
                className="w-8 h-8"
              />
            </Link>
            <div className="flex items-center gap-2 py-2 px-3 border border-border rounded-md bg-[var(--footer-bg)]/70">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#00ccff" }}
              ></div>
              <span className="text-xs font-mono">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
