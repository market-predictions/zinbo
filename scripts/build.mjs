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
const expected = 'b355b16b3ee9820c5dc30784024efa701ddbe8d52f8b03af3183bb5658fe4d14';

if (checksum !== expected) {
  throw new Error('Zinbo HTML checksum mismatch: refusing to deploy a changed or incomplete artifact');
}

// The owner-attested review is bound to the exact three content banks.
// A changed exercise cannot silently inherit the previous approval.
function embeddedJSON(source,token){
  let i=source.indexOf(token);
  if(i<0)throw Error('Missing content bank: '+token);
  i+=token.length;
  while(/\s/.test(source[i]))i++;
  const first=i;
  let depth=0,quoted=false,escaped=false;
  for(;i<source.length;i++){
    const c=source[i];
    if(quoted){
      if(escaped)escaped=false;
      else if(c==='\\')escaped=true;
      else if(c==='"')quoted=false;
      continue;
    }
    if(c==='"'){quoted=true;continue;}
    if(c==='{'||c==='[')depth++;
    if(c==='}'||c===']')depth--;
    if(depth===0)return JSON.parse(source.slice(first,i+1));
  }
  throw Error('Incomplete bank: '+token);
}
const source=html.toString('utf8');
const evidence=JSON.parse(await readFile(new URL('../docs/CONTENT_REVIEW_2026-10-28.json',import.meta.url),'utf8'));
if(evidence.schema!=='zinbo.content-review.v1'||
   !evidence.reviewer?.name?.trim()||
   !/^\d{4}-\d{2}-\d{2}$/.test(evidence.reviewer.date||'')||
   evidence.provenance?.status!=='owner-attested independent expert review')
  throw Error('Missing or malformed review attestation');
const banks={
  v43:embeddedJSON(source,'const V43_CANDIDATES ='),
  o3:embeddedJSON(source,'const O3_PILOT ='),
  vtt:embeddedJSON(source,'const VTT_PILOT =')
};
const ids=[];
for(const [name,bank] of Object.entries(banks)){
  const list=Array.isArray(bank)?bank:Object.values(bank).flat();
  const digest=createHash('sha256').update(JSON.stringify(bank),'utf8').digest('hex');
  const expectedBank=evidence.banks?.[name];
  if(!expectedBank||expectedBank.sha256!==digest||expectedBank.items!==list.length)
    throw Error('Content changed since expert-review attestation: '+name);
  ids.push(...list.map(item=>item.id));
}
if(ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)
  throw Error('Duplicate or malformed approved item IDs');
const marker='const QA_PREVIEW=false;';
if(source.split(marker).length!==2)throw Error('Missing production QA guard');
const built=source.replace(marker,'const RELEASE_REVIEW_IDS=new Set('+JSON.stringify(ids)+');\n  '+marker);
await mkdir(publicDir,{recursive:true});
await writeFile(new URL('index.html',publicDir),built,'utf8');
console.log('Zinbo P0 candidate artifact validated:',Buffer.byteLength(built,'utf8'),'bytes; reviewed bank items:',ids.length);
