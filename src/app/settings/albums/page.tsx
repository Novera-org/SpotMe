import { getAlbumSettingsData } from "@/actions/settings";
import { AlbumsSettingsPanel } from "@/components/settings/albums-settings-panel";

export default async function AlbumSettingsPage() {
  const albums = await getAlbumSettingsData();

  return <AlbumsSettingsPanel initialAlbums={albums} />;
}
