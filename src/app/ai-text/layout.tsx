import { Toaster } from "~/components/ui/toaster"
export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">{children}</main>
      <Toaster />
    </div>
  );
}
