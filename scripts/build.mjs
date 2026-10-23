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
const expected = '8de75448d5cc65a95919c5ab02e459aeb994f442aa2a0e0e7f53004afbf35f8b';

if (checksum !== expected) {
  throw new Error('Zinbo HTML checksum mismatch: refusing to deploy a changed or incomplete artifact');
}

await mkdir(publicDir, { recursive: true });
await writeFile(new URL('index.html', publicDir), html);
console.log('Zinbo P0 candidate artifact validated:', html.length, 'bytes');
