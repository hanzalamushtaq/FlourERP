import fs from 'fs';
import path from 'path';

export interface BackupResult {
  success: boolean;
  backupPath: string;
  filename: string;
  sizeBytes: number;
  timestamp: string;
}

/**
 * Creates an automated timestamped backup of the SQLite database (BACKUP-01)
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  // Resolve DB path whether running from repo root or apps/api
  let dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  let backupsDir = path.resolve(process.cwd(), 'backups');

  if (!fs.existsSync(dbPath)) {
    dbPath = path.resolve(process.cwd(), 'apps/api/prisma/dev.db');
    backupsDir = path.resolve(process.cwd(), 'apps/api/backups');
  }

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Source database file not found at: ${dbPath}`);
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `flour_erp_backup_${dateStr}_${timeStr}.db`;
  const backupPath = path.join(backupsDir, filename);

  // Copy SQLite database file
  fs.copyFileSync(dbPath, backupPath);

  // Verify backup exists and get size
  const stats = fs.statSync(backupPath);
  if (stats.size === 0) {
    throw new Error(`Backup file is empty: ${backupPath}`);
  }

  return {
    success: true,
    backupPath,
    filename,
    sizeBytes: stats.size,
    timestamp: now.toISOString(),
  };
}
