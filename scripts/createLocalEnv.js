// Записывает случайные локальные пароли и ключ JWT при первом запуске.
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

export function createLocalEnv() {
  const dbPassword = randomBytes(24).toString('hex');
  const lines = [
    '# Локальные реквизиты. Доступны только владельцу файла.',
    `DATABASE_URL=postgresql://taskboard:${dbPassword}@127.0.0.1:${process.env.LOCAL_DB_PORT ?? 55434}/postgres`,
    `PORT=${process.env.PORT ?? 4174}`,
    `JWT_SECRET=${randomBytes(48).toString('hex')}`,
    'ADMIN_EMAIL=admin@example.test',
    `ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}`,
    'DEMO_EMAIL=demo@example.test',
    `DEMO_PASSWORD=${randomBytes(18).toString('base64url')}`
  ];
  writeFileSync('.env', lines.join('\n') + '\n', { mode: 0o600, flag: 'wx' });
}
