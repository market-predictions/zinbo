import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async path=>readFile(new URL(path,root),'utf8');

// The served code is reconstructed from maintained sources; the old 15
// arbitrary 600-KB HTML slices and whole-file hash are no longer the source.
const banks=['ORDER','MORPH','ADVANCED','V43_CANDIDATES','O3_PILOT','VTT_PILOT','V43_RESOLUTION_PASS'];
let app=(await Promise.all(['runtime','worlds','screens'].map(name=>read('src/app/'+name+'.js')))).join('');
for(const name of banks){
  const token='__ZINBO_CONTENT_'+name+'__';
  if(app.split(token).length!==2)throw Error('Missing or duplicated content token '+name);
  const raw=await read('src/content/'+name.toLowerCase()+'.json');
  JSON.parse(raw);
  app=app.replace(token,raw);
}
// Verify the original artwork survived extraction byte-for-byte.
const manifest=JSON.parse(await read('src/art-manifest.json'));
if(manifest.schema!=='zinbo.art-manifest.v1'||manifest.images.length!==37)
  throw Error('Image manifest incomplete');
for(const asset of manifest.images){
  if(!/^[a-z0-9-]+\.webp$/.test(asset.name))throw Error('Invalid art name '+asset.name);
  const bytes=await readFile(new URL('public/art/'+asset.name,root));
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(bytes.length!==asset.bytes||sha!==asset.gitBlobSha||bytes.toString('ascii',0,4)!=='RIFF')
    throw Error('Original WebP has changed: '+asset.name);
}
const dog=await readFile(new URL('public/art/pet-dog.webp',root));
if(createHash('sha256').update(dog).digest('hex')!=='b083fafc89ee16ba6558f9cd086e8291b1c636e977b176a14cdfad544fb414ee')
  throw Error('Approved pet-dog scene changed');
const vp8=dog.indexOf(Buffer.from('VP8 '));
if(vp8<12||(dog.readUInt16LE(vp8+14)&0x3fff)!==1536||(dog.readUInt16LE(vp8+16)&0x3fff)!==1024)
  throw Error('Approved dog scene dimensions changed');
function embeddedJSON(source,token){
  let i=source.indexOf(token);if(i<0)throw Error('Missing bank '+token);
  i+=token.length;while(/\s/.test(source[i]))i++;
  const first=i;let depth=0,quoted=false,escaped=false;
  for(;i<source.length;i++){
    const c=source[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"'){quoted=true;continue;}
    if(c==='{'||c==='[')depth++;
    if(c==='}'||c===']')depth--;
    if(depth===0)return JSON.parse(source.slice(first,i+1));
  }
  throw Error('Incomplete bank '+token);
}
const evidence=JSON.parse(await read('docs/CONTENT_REVIEW_2026-10-28.json'));
if(evidence.schema!=='zinbo.content-review.v1'||!evidence.reviewer?.name?.trim()||
  !/^\d{4}-\d{2}-\d{2}$/.test(evidence.reviewer.date||'')||
  evidence.provenance?.status!=='owner-attested independent expert review')
  throw Error('Missing or malformed owner review attestation');
const approved={
  v43:embeddedJSON(app,'const V43_CANDIDATES ='),
  o3:embeddedJSON(app,'const O3_PILOT ='),
  vtt:embeddedJSON(app,'const VTT_PILOT =')
};
const ids=[];
for(const [name,bank] of Object.entries(approved)){
  const list=Array.isArray(bank)?bank:Object.values(bank).flat();
  const digest=createHash('sha256').update(JSON.stringify(bank),'utf8').digest('hex');
  if(evidence.banks?.[name]?.sha256!==digest||evidence.banks?.[name]?.items!==list.length)
    throw Error('Content modified without renewed owner-approved review: '+name);
  ids.push(...list.map(item=>item.id));
}
if(ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)
  throw Error('Duplicate or malformed approved exercise ID');
const qa='const QA_PREVIEW=false;';
if(app.split(qa).length!==2)throw Error('Missing production QA guard');
app=app.replace(qa,'const RELEASE_REVIEW_IDS=new Set('+JSON.stringify(ids)+');\n  '+qa);
const template=await read('src/templates/index.html');
if(template.split('__ZINBO_APP__').length!==2)throw Error('Bad template');
const html=template.replace('__ZINBO_APP__',app);
const dir=new URL('public/',root);
await mkdir(dir,{recursive:true});
await writeFile(new URL('index.html',dir),html,'utf8');
await writeFile(new URL('styles.css',dir),await read('src/styles/legacy.css'),'utf8');
console.log('Zinbo phase 1 build:',Buffer.byteLength(html),'HTML bytes,',manifest.images.length,'standalone WebP assets,',ids.length,'attested candidate IDs');
