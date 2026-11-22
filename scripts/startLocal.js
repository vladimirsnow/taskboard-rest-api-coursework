// Подготавливает личный кластер PostgreSQL, применяет миграции и запускает сайт.
import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { createLocalEnv } from './createLocalEnv.js';

process.umask(0o077);
if (!existsSync('.env')) createLocalEnv();
process.loadEnvFile('.env');
const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.pathname !== '/postgres') {
  throw new Error('Для собственной базы используйте npm run start:external (см. README).');
}
mkdirSync('.local', { recursive: true });
const databaseDir = resolve('.local/postgres');
const database = new EmbeddedPostgres({
  databaseDir, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  port: Number(url.port), persistent: true, authMethod: 'scram-sha-256',
  autoRehydrateSymlinks: true,
  postgresFlags: ['-h', '127.0.0.1', '-c', "unix_socket_directories="],
  initdbFlags: ['--encoding=UTF8', '--locale=C']
});
try {
  if (!existsSync(resolve(databaseDir, 'PG_VERSION'))) await database.initialise();
  await database.start();
  const cli = resolve('node_modules/prisma/build/index.js');
  execFileSync(process.execPath, [cli, 'generate'], { stdio: 'inherit' });
  execFileSync(process.execPath, [cli, 'migrate', 'deploy'], { stdio: 'inherit' });
  execFileSync(process.execPath, ['scripts/seedDatabase.js'], { stdio: 'inherit' });
  await import('../server.js');
} catch (error) {
  await database.stop();
  throw error;
}
