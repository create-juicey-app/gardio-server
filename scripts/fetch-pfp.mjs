import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pfpPath = path.join(__dirname, '..', 'public', 'pfp.png');
const gravatarUrl = 'https://gravatar.com/juiceydev.json';

export default async function fetchPfp() {
  try {
    console.log('Fetching Gravatar profile...');
    const gravatarProfileResponse = await fetch(gravatarUrl);
    if (!gravatarProfileResponse.ok) {
      throw new Error(`Failed to fetch Gravatar profile: ${gravatarProfileResponse.statusText}`);
    }

    const profile = await gravatarProfileResponse.json();
    const thumbnailUrl = profile.entry?.[0]?.thumbnailUrl;

    if (!thumbnailUrl) {
      throw new Error('Could not find thumbnail URL in Gravatar profile.');
    }

    const imageUrl = `${thumbnailUrl}?s=200`; // Request a 200px image
    console.log(`Fetching profile picture from ${imageUrl}`);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch profile picture: ${imageResponse.statusText}`);
    }

    const newImageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    try {
      const existingImageBuffer = await fs.readFile(pfpPath);
      if (Buffer.compare(newImageBuffer, existingImageBuffer) === 0) {
        console.log('Profile picture is already up to date. Skipping write.');
        return;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // If it's an error other than "file not found", re-throw it.
        throw error;
      }
      // If file does not exist, we'll proceed to write it.
      console.log('No existing profile picture found. Creating new file.');
    }

    await fs.writeFile(pfpPath, newImageBuffer);
    console.log(`Profile picture updated and saved to ${pfpPath}`);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    // Exit with an error code to prevent a broken build/start
    process.exit(1);
  }
}
