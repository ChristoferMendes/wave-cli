import { join } from 'path';
import { Cli } from 'wave-shell';

const projectRoot = join(import.meta.dir, 'dist')
const cli = new Cli('wave', projectRoot)

cli.run();
