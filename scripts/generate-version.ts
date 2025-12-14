import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface VersionData {
  date: string;
  buildNumber: number;
}

const versionFilePath = join(process.cwd(), '.version.json');

function generateVersion(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  let versionData: VersionData = {
    date: dateStr,
    buildNumber: 1
  };

  // Read existing version data if it exists
  if (existsSync(versionFilePath)) {
    try {
      const existingData: VersionData = JSON.parse(readFileSync(versionFilePath, 'utf-8'));
      
      // If it's the same day, increment build number
      if (existingData.date === dateStr) {
        versionData.buildNumber = existingData.buildNumber + 1;
      }
      // Otherwise, reset to 1 (new day)
    } catch (error) {
      console.warn('Could not read existing version data, starting fresh');
    }
  }

  // Save the version data
  writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

  const version = `${dateStr}.${versionData.buildNumber}`;
  console.log(`Generated version: ${version}`);
  
  return version;
}

// Generate and export the version
const version = generateVersion();

// Create a TypeScript module that exports the version
const versionModule = `// This file is auto-generated during build
export const APP_VERSION = '${version}';
`;

writeFileSync(join(process.cwd(), 'src', 'version.ts'), versionModule);

// Also create a version file for the server
const serverVersionModule = `// This file is auto-generated during build
export const APP_VERSION = '${version}';
`;

writeFileSync(join(process.cwd(), 'server', 'version.ts'), serverVersionModule);

export { version };
