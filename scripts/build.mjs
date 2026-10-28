import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

// The release HTML is stored in pieces solely to fit the GitHub connector's
// upload limits. Reconstruct exactly the accepted offline author preview.
const sourceDir = new URL('../src/html-parts/', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
const filenames = (await readdir(sourceDir))
  .filter(name => /^part-\d{3}\.txt$/.test(name))
  .sort();

if (filenames.length !== 15) {
  throw new Error('Incomplete Zinbo source: expected 15 ordered segments');
}

const parts = await Promise.all(filenames.map(name => readFile(new URL(name, sourceDir))));
const html = Buffer.concat(parts);
const checksum = createHash('sha256').update(html).digest('hex');
const expected = 'c58b249240f7bf8bf4162d307b60832fec8e02ba4c25c37b94134ffee68c34ba';

if (checksum !== expected) {
  throw new Error('Zinbo HTML checksum mismatch: refusing to deploy a changed or incomplete artifact');
}

await mkdir(publicDir, { recursive: true });
await writeFile(new URL('index.html', publicDir), html);
console.log('Zinbo P0 candidate artifact validated:', html.length, 'bytes');
