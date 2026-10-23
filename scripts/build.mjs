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
const expected = '63dc7d0b5d1fa512bf687435c9566b21e496156d87033ccfcfa3d9e3b87f6d7b';

if (checksum !== expected) {
  throw new Error('Zinbo HTML checksum mismatch: refusing to deploy a changed or incomplete artifact');
}

await mkdir(publicDir, { recursive: true });
await writeFile(new URL('index.html', publicDir), html);
console.log('Zinbo P0 candidate artifact validated:', html.length, 'bytes');
