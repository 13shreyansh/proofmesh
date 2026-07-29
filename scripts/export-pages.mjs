import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const projectRoot = process.cwd();
const docsDir = resolve(projectRoot, "docs");

if (basename(docsDir) !== "docs") {
  throw new Error("Refusing to replace an unexpected export directory.");
}

const response = await fetch("http://127.0.0.1:3002/");
if (!response.ok) {
  throw new Error(`Local production render failed with ${response.status}.`);
}

const rendered = await response.text();
const portableHtml = rendered
  .replaceAll('href="/assets/', 'href="./assets/')
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('"/assets/', '"./assets/')
  .replaceAll('href="/favicon.svg"', 'href="./favicon.svg"')
  .replaceAll('content="/proofmesh-social.png"', 'content="./proofmesh-social.png"')
  .replaceAll('href="/proofmesh-social.png"', 'href="./proofmesh-social.png"');

await rm(docsDir, { recursive: true, force: true });
await mkdir(docsDir, { recursive: true });
await cp(join(projectRoot, "dist/client"), docsDir, { recursive: true });
await writeFile(join(docsDir, "index.html"), portableHtml);
await writeFile(join(docsDir, "404.html"), portableHtml);
await writeFile(join(docsDir, ".nojekyll"), "");

console.log(`Static reviewer build exported to ${docsDir}`);
