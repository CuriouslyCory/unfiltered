import { auth } from "~/server/auth";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Admin Panel
          </h1>
          <p className="text-center text-2xl text-white">
            Welcome {session?.user?.name}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/admin/documents"
            className="rounded-lg bg-white/10 px-8 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            Manage Documents
          </Link>
          <Link
            href="/api/auth/signout"
            className="rounded-lg bg-white/10 px-8 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            Sign out
          </Link>
        </div>
      </div>
    </main>
  );
}
