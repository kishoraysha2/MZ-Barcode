import path from 'path';
import fs from 'fs';
import { DIRECTORY_NAMES, APP_METADATA } from '../shared/constants';
import { SystemDirectories } from '../shared/types';

export function getAppDataPath(): string {
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'AppData', 'Roaming');
  }
  if (process.platform === 'darwin') {
    return path.join(process.env.HOME || '/Users', 'Library', 'Application Support');
  }
  return path.join(process.env.HOME || '/home', '.config');
}

export function getSuiteRootPath(): string {
  return path.join(getAppDataPath(), APP_METADATA.SHORT_NAME);
}

export function initializeDirectories(): SystemDirectories {
  const root = getSuiteRootPath();

  const dirs: SystemDirectories = {
    dataDir: path.join(root, DIRECTORY_NAMES.DATA),
    backupDir: path.join(root, DIRECTORY_NAMES.BACKUP),
    logsDir: path.join(root, DIRECTORY_NAMES.LOGS),
    licenseDir: path.join(root, DIRECTORY_NAMES.LICENSE),
    configDir: path.join(root, DIRECTORY_NAMES.CONFIG),
    cacheDir: path.join(root, DIRECTORY_NAMES.CACHE),
    tempDir: path.join(root, DIRECTORY_NAMES.TEMP),
  };

  Object.values(dirs).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return dirs;
}
