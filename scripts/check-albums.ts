import { db } from "../src/lib/db";
import { albums, images } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allAlbums = await db.query.albums.findMany({
    with: {
      images: {
        limit: 5,
        columns: {
          id: true,
          status: true,
          r2Url: true,
        }
      }
    }
  });

  for (const a of allAlbums) {
    console.log(`Album: ${a.title}`);
    for (const img of a.images) {
      console.log(`  img: ${img.id} | status: ${img.status} | url format correct? ${img.r2Url.startsWith('http') || img.r2Url.startsWith('/')}`);
      console.log(`    r2Url: ${img.r2Url.slice(0, 50)}...`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
