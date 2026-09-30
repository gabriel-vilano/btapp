import { AppShell } from "@/src/components/shell/AppShell";
import { mockShellBadges } from "@/src/mocks/shellBadges";
import { loadProfileAvatar } from "./profileAvatar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileAvatar = await loadProfileAvatar();

  return (
    <AppShell badges={mockShellBadges()} profileAvatar={profileAvatar}>
      {children}
    </AppShell>
  );
}
