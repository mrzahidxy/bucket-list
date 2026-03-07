"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { appNavLinks, isNavLinkActive } from "@/components/layout/navLinks";

export const MobileBottomNav = (): React.JSX.Element => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-panel/95 px-4 py-2 backdrop-blur md:hidden">
      <ul
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${appNavLinks.length}, minmax(0, 1fr))` }}
      >
        {appNavLinks.map((link) => {
          const active = isNavLinkActive(pathname, link.href);
          const Icon = link.icon;

          return (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs",
                  active ? "text-primary" : "text-slate-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
