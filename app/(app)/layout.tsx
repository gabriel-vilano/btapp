import { AppShell } from "@/src/components/shell/AppShell";
import { ToastProvider } from "@/src/components/ui/Toast";
import { mockShellBadges } from "@/src/mocks/shellBadges";
import { loadProfileAvatar } from "./profileAvatar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileAvatar = await loadProfileAvatar();

  return (
    <ToastProvider>
      <AppShell badges={mockShellBadges()} profileAvatar={profileAvatar}>
        {children}
      </AppShell>
    </ToastProvider>
  );
}
