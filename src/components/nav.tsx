"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/menu-quiz", label: "Menu Quiz" },
  { href: "/know-your-rights", label: "Know Your Rights" },
  { href: "/customer-simulator", label: "Customer Simulator" },
  { href: "/difficult-customer", label: "Difficult Customer" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl items-center gap-6 overflow-x-auto px-6 py-4">
        <Link
          href="/"
          className="font-semibold tracking-tight whitespace-nowrap"
        >
          ServePrep
        </Link>
        <ul className="flex gap-4 text-sm">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    active
                      ? "font-medium whitespace-nowrap text-zinc-950 dark:text-zinc-50"
                      : "whitespace-nowrap text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
