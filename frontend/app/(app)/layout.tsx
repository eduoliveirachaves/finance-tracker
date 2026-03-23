import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
