import { $ } from "bun";
import { WavePrint } from "wave-shell";

async function builder() {
  const print = WavePrint('Builder');
  print.info("Building project...");

  const allCommandFiles = await getAllCommandFiles();
  const entrypointsFromCommands = getEntrypointsFromCommands(allCommandFiles);
  await buildBun(entrypointsFromCommands);

  await $`touch dist/.built`;

  print.success("Project built successfully!");
}

async function getAllCommandFiles() {
  return await $`ls src/commands`.text();
}

function getEntrypointsFromCommands(allCommandFiles: string): string[] {
  return allCommandFiles.split("\n").filter(Boolean).map((file) => `src/commands/${file}`);
}

async function buildBun(extraEntrypoints: string[]) {
  await Bun.build({
    entrypoints: ["index.ts", ...extraEntrypoints],
    outdir: "dist",
    minify: true,
    target: "bun",
  });
}

await builder();
