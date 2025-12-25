"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  const nav = [
    { title: "Home", href: "/" },
    { title: "All Models", href: "/models" },
    { title: "Images", href: "/models/images" },
    { title: "Videos", href: "/models/videos" },
    { title: "Lipsync", href: "/models/lipsync" },
    { title: "Providers", href: "/providers" },
  ];

  return (
    <header className=" border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-semibold text-lg">Versely Studio .</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm text-gray-100 hover:text-blue-600">
                {n.title}
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <details className="relative">
              <summary className="list-none cursor-pointer text-gray-700">Menu</summary>
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-sm p-2">
                {nav.map((n) => (
                  <div key={n.href} className="py-1">
                    <Link href={n.href} className="text-sm text-gray-700 block">
                      {n.title}
                    </Link>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
