import { $ } from "bun";
import { WavePrint } from "wave-shell";

async function builder() {
  const print = WavePrint('Builder');
  print.info("Building project...");


  const extraEntrypoints = await getAllFilesInsideSubdirectoriesOfSrc();
  const extraEntrypointsString = extraEntrypoints.split("\n").filter(Boolean);

  await buildBun(extraEntrypointsString);
}


async function getAllFilesInsideSubdirectoriesOfSrc() {
  return await $`find src -type f -mindepth 2`.text();
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
