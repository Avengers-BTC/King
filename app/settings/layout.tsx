import { Metadata } from "next";
import { SettingsNav } from "@/components/settings-nav";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-10">
      <aside className="hidden w-[200px] flex-col md:flex">
        <SettingsNav />
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
