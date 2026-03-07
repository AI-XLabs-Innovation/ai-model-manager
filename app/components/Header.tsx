"use client";
import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../login/actions";

export default function Header() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Don't render header on the login page
  if (pathname === "/login") return null;

  const nav = [
    { title: "Dashboard", href: "/" },
    { title: "Users", href: "/users" },
    { title: "Purchases", href: "/purchases" },
    { title: "Models", href: "/models" },
    { title: "Providers", href: "/providers" },
  ];

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

          <nav className="hidden md:flex items-center gap-4">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm hover:text-blue-400 transition-colors ${
                  pathname === n.href ? "text-blue-400 font-medium" : "text-gray-300"
                }`}
              >
                {n.title}
              </Link>
            ))}
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
                <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-2 z-50">
                  {nav.map((n) => (
                    <div key={n.href} className="py-1">
                      <Link href={n.href} className="text-sm text-gray-200 block px-2 py-1 rounded hover:bg-white/10">
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

