import { Home, ListChecks, User } from "lucide-react";

export const appNavLinks = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/buckets", icon: ListChecks, label: "Buckets" },
  { href: "/profile", icon: User, label: "Profile" }
] as const;

export const isNavLinkActive = (pathname: string, href: string): boolean => {
  if (href === "/dashboard") {
    return pathname.startsWith("/dashboard") || pathname.startsWith("/lists");
  }

  return pathname.startsWith(href);
};
