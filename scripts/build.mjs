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
const expected = 'a4bceec4e6c70366f7678c848db276c15fd5bb4c5756351fcbe60b5dc95e05b0';

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
const dogPrefix='"pet-dog.webp":"data:image/webp;base64,';
const dogStart=source.indexOf(dogPrefix);
if(dogStart<0)throw Error('Dog illustration missing from V43_ART');
const dogEnd=source.indexOf('"',dogStart+dogPrefix.length);
if(dogEnd<0)throw Error('Dog WebP data is incomplete');
const dogBytes=Buffer.from(source.slice(dogStart+dogPrefix.length,dogEnd),'base64');
if(createHash('sha256').update(dogBytes).digest('hex')!=='b083fafc89ee16ba6558f9cd086e8291b1c636e977b176a14cdfad544fb414ee')
  throw Error('The petting-dog illustration differs from the reviewed release artwork');
if(dogBytes.toString('ascii',0,4)!=='RIFF')throw Error('Petting-dog illustration must be WebP');
const vp8=dogBytes.indexOf(Buffer.from('VP8 '));
if(vp8<12 || (dogBytes.readUInt16LE(vp8+14)&0x3fff)!==1536 ||
            (dogBytes.readUInt16LE(vp8+16)&0x3fff)!==1024)
  throw Error('Petting-dog illustration must be 1536x1024 WebP');

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
