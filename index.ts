import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Cli } from 'wave-shell';

const isDevMode = existsSync(join(import.meta.dir, '..', 'src'));

const projectRoot = isDevMode ? join(import.meta.dir, '..') : join(import.meta.dir, '..', 'dist');

const cli = new Cli('Wave Cli 🌊', projectRoot);
await cli.run();
