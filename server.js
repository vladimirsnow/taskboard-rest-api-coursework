// Запускает Express, раздаёт сайт и подключает JSON API с общей обработкой ошибок.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { api } from './routes/api.js';
import { handleError } from './middleware/handleError.js';
import { once } from 'node:events';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Укажите JWT_SECRET длиной не менее 32 символов.');
}
const app = express();
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '32kb' }), api);
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.use(handleError);
const port = Number(process.env.PORT ?? 4174);
export const server = app.listen(port, '127.0.0.1');
await once(server, 'listening');
console.log(`Доска задач открыта по адресу http://127.0.0.1:${port}`);
