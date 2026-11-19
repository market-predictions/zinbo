import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async path=>readFile(new URL(path,root),'utf8');

// The served code is reconstructed from maintained sources; the old 15
// arbitrary 600-KB HTML slices and whole-file hash are no longer the source.
const banks=['ORDER','MORPH','ADVANCED','V43_CANDIDATES','O3_PILOT','VTT_PILOT','V43_RESOLUTION_PASS','CHOICE_PILOT'];
let app=(await Promise.all(['runtime','worlds','screens'].map(name=>read('src/app/'+name+'.js')))).join('');
for(const name of banks){
  const token='__ZINBO_CONTENT_'+name+'__';
  if(app.split(token).length!==2)throw Error('Missing or duplicated content token '+name);
  const raw=await read('src/content/'+name.toLowerCase()+'.json');
  JSON.parse(raw);
  app=app.replace(token,raw);
}
// New answer variants are available only after owner-attested logopedist approval.
// Keep a hard release gate and preserve the independent-review evidence boundary.
const choicePilot=JSON.parse(await read('src/content/choice_pilot.json'));
if(choicePilot.schema!=='zinbo.choice-variation-pilot.v1'||
   choicePilot.releaseStatus!=='owner-attested-approved'||
   choicePilot.approval?.source!=='owner-confirmation-in-Zinbo-project-chat'||
   choicePilot.approval?.date!=='2026-11-19'||
   choicePilot.approval?.pr!==17||
   choicePilot.approval?.logopedistApprovedAsReportedByOwner!==true||
   choicePilot.approval?.independentReportProvided!==false||
   !Array.isArray(choicePilot.items)||choicePilot.items.length!==16)
  throw Error('Choice pilot must contain exactly 16 isolated candidates');
const sourceAdvanced=JSON.parse(await read('src/content/advanced.json'));
const sourceV43=JSON.parse(await read('src/content/v43_candidates.json'));
const sourceById=new Map([...Object.values(sourceAdvanced).flat(),
  ...Object.values(sourceV43).flat()].map(item=>[item.id,item]));
const seenPilotIds=new Set();
for(const candidate of choicePilot.items){
  const original=sourceById.get(candidate.sourceId);
  if(!original||!['tense','strong'].includes(original.kind)||
     !Array.isArray(original.choices)||original.choices.length!==2||
     !original.choices.includes(original.ending)||seenPilotIds.has(candidate.sourceId)||
     !/^[a-z]+(?:-[a-z]+)*$/.test(candidate.lexeme||'')||
     candidate.reviewStatus!=='owner-attested-approved'||
     !Array.isArray(candidate.extra)||candidate.extra.length!==2)
    throw Error('Malformed or duplicate choice pilot candidate: '+candidate.sourceId);
  seenPilotIds.add(candidate.sourceId);
  const expectedTags=['agreement','time-and-agreement'];
  const allForms=[...original.choices];
  for(let i=0;i<2;i++){
    const option=candidate.extra[i];
    if(!option||option.possibleError!==expectedTags[i]||
      typeof option.form!=='string'||!/^[a-zà-ÿ]+$/i.test(option.form)||
      allForms.includes(option.form))
      throw Error('Unusable pilot distractor for '+candidate.sourceId);
    allForms.push(option.form);
  }
  if(allForms.filter(v=>v===original.ending).length!==1||new Set(allForms).size!==4)
    throw Error('Pilot must have exactly one correct form: '+candidate.sourceId);
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
const tokenData=JSON.parse(await read('docs/design-system/tokens.json'));
const props=[
  ...tokenData.color.tokens.map(t=>['--zb-'+t.name,t.value]),
  ...tokenData.spacing.tokens.map(t=>['--zb-'+t.name,t.value]),
  ...tokenData.radius.tokens.map(t=>['--zb-'+t.name,t.value]),
  ...tokenData.shadow.tokens.map(t=>['--zb-'+t.name,t.value]),
  ...tokenData.type.groups.flatMap(g=>g.styles.map(t=>['--zb-font-size-'+t.name,t.fontSize])),
  ['--zb-font',tokenData.type.families.sans]
];
if(new Set(props.map(([name])=>name)).size!==props.length)throw Error('Duplicate Claude design token');
const tokenCSS=[
  ...[400,700,800].map(weight=>'@font-face{font-family:"Nunito";font-style:normal;font-weight:'+weight+';font-display:swap;src:url("./fonts/nunito-latin-'+weight+'-normal.woff2") format("woff2")}'),
  ':root{'+props.map(([name,value])=>name+':'+value+';').join('')+'}'
].join('\n');
await writeFile(new URL('styles.css',dir),tokenCSS+'\n'+await read('src/styles/zinbo.css'),'utf8');
console.log('Zinbo phase 1 build:',Buffer.byteLength(html),'HTML bytes,',manifest.images.length,'standalone WebP assets,',ids.length,'attested candidate IDs');
