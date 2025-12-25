import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <main className="max-w-4xl mx-auto bg-white dark:bg-black p-8 rounded shadow">
        <h1 className="text-3xl font-semibold mb-4">Admin Dashboard</h1>
        <p className="mb-6">Quick links to AI models pages:</p>
        <ul className="space-y-2">
          <li>
            <Link href="/models" className="text-blue-600">All Models</Link>
          </li>
          <li>
            <Link href="/models/images" className="text-blue-600">Image Models</Link>
          </li>
          <li>
            <Link href="/models/videos" className="text-blue-600">Video Models</Link>
          </li>
          <li>
            <Link href="/models/lipsync" className="text-blue-600">Lipsync Models</Link>
          </li>
          <li>
            <Link href="/providers" className="text-blue-600">Providers</Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
