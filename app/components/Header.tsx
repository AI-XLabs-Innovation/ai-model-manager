"use client";
import React, { useTransition, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../login/actions";

export default function Header() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [moreOpen, setMoreOpen] = useState(false);

  // Don't render header on the login page
  if (pathname === "/login") return null;

  const primaryNav = [
    { title: "Dashboard", href: "/" },
    { title: "Users", href: "/users" },
    { title: "Purchases", href: "/purchases" },
    { title: "Models", href: "/models" },
    { title: "Generations", href: "/generations" },
  ];

  const moreNav = [
    { title: "Pricing", href: "/pricing" },
    { title: "API Keys", href: "/api-keys" },
    { title: "Providers", href: "/providers" },
    { title: "Landing Media", href: "/landing-media" },
    { title: "Notifications", href: "/notifications" },
    { title: "System", href: "/system" },
    { title: "Beta Invite", href: "/beta-invite" },
  ];

  const allNav = [...primaryNav, ...moreNav];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  function handleSignOut() {
    startTransition(() => {
      signOut();
    });
  }

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-semibold text-lg">Versely Studio .</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            {primaryNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm hover:text-blue-400 transition-colors ${
                  isActive(n.href) ? "text-blue-400 font-medium" : "text-gray-300"
                }`}
              >
                {n.title}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 200)}
                className={`text-sm hover:text-blue-400 transition-colors ${
                  moreNav.some((n) => isActive(n.href)) ? "text-blue-400 font-medium" : "text-gray-300"
                }`}
              >
                More ▾
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-1 z-50">
                  {moreNav.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`block text-sm px-3 py-2 rounded hover:bg-white/10 ${
                        isActive(n.href) ? "text-blue-400 font-medium" : "text-gray-200"
                      }`}
                    >
                      {n.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="hidden md:block text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {isPending ? "Signing out…" : "Sign out"}
            </button>

            {/* Mobile menu */}
            <div className="md:hidden">
              <details className="relative">
                <summary className="list-none cursor-pointer text-gray-300">Menu</summary>
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-2 z-50">
                  {allNav.map((n) => (
                    <div key={n.href} className="py-0.5">
                      <Link
                        href={n.href}
                        className={`text-sm block px-2 py-1.5 rounded hover:bg-white/10 ${
                          isActive(n.href) ? "text-blue-400 font-medium" : "text-gray-200"
                        }`}
                      >
                        {n.title}
                      </Link>
                    </div>
                  ))}
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="w-full text-left text-sm text-red-400 px-2 py-1 rounded hover:bg-white/10 disabled:opacity-50"
                  >
                    Sign out
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
