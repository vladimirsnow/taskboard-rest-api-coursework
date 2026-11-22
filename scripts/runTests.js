// Запускает HTTP-тесты с реквизитами текущего локального экземпляра.
import { spawnSync } from 'node:child_process';

process.env.API_URL ??= `http://127.0.0.1:${process.env.PORT ?? 4174}`;
const result = spawnSync(process.env.PYTHON ?? 'python3', ['-B', '-m', 'unittest', 'discover', '-s', 'tests', '-v'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
