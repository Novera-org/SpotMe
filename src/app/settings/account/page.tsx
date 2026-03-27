import { getAccountSettingsData } from "@/actions/settings";
import { AccountSettingsPanel } from "@/components/settings/account-settings-panel";

export default async function AccountSettingsPage() {
  const data = await getAccountSettingsData();

  return (
    <AccountSettingsPanel
      initialName={data.user.name}
      email={data.user.email}
      sessions={data.sessions}
    />
  );
}
