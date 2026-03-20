"use client";
import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <main className="ml-0 md:ml-[240px] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </main>
  );
}
