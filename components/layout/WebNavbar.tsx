"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { appNavLinks, isNavLinkActive } from "@/components/layout/navLinks";

export const WebNavbar = (): React.JSX.Element => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-panel/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="rounded-lg bg-primary p-2 text-white">
            <Rocket className="h-4 w-4" />
          </span>
          <span className="text-xl font-bold text-text">BucketList</span>
        </Link>

        <nav>
          <ul className="flex items-center gap-1">
            {appNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isNavLinkActive(pathname, link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active ? "bg-primarySoft text-primary" : "text-slate-600 hover:bg-slate-100"
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
      </div>
    </header>
  );
};
