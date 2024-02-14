import { join } from 'path';
import { Cli } from 'wave-shell';

const projectRoot = join(__dirname, 'dist')
const cli = new Cli('wave', projectRoot)

cli.run();
