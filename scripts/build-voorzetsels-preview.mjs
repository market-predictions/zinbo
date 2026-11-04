// Isolated prepositions trial. Production index.html is reconstructed and validated
// by build.mjs before this module runs. We only reuse its existing WebP bytes.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {join} from 'node:path';

const root=new URL('../',import.meta.url);
const source=await readFile(new URL('public/index.html',root),'utf8');
const template=await readFile(new URL('preview/voorzetsels-test.html',root),'utf8');
const items=JSON.parse(await readFile(new URL('preview/voorzetsels-items.json',root),'utf8'));
const assert=(condition,message)=>{if(!condition)throw Error('Prepositions preview: '+message);};

assert(Array.isArray(items)&&items.length>=20,'expected at least 20 candidate items');
assert(template.split('__ITEMS__').length===2,'expected exactly one item-bank placeholder');
const ids=new Set();
for(const item of items){
  assert(typeof item.id==='string'&&!ids.has(item.id),'duplicate/invalid item ID');
  ids.add(item.id);
  assert([1,2,3,4].includes(item.level),'invalid level '+item.id);
  assert(/^[a-z0-9-]+\.webp$/.test(item.art),'invalid image filename '+item.id);
  assert(typeof item.before==='string'&&item.before.trim()&&typeof item.after==='string'&&item.after.trim(),'missing text '+item.id);
  assert(Array.isArray(item.choices)&&item.choices.length>=2&&item.choices.length<=3,'invalid options '+item.id);
  assert(new Set(item.choices).size===item.choices.length,'duplicate options '+item.id);
  assert(item.choices.filter(choice=>choice===item.answer).length===1,'answer must appear exactly once '+item.id);
}
for(const level of [1,2,3,4]){
  const current=items.filter(item=>item.level===level);
  assert(current.length>=5,'fewer than five items at level '+level);
  assert(new Set(current.map(item=>item.art)).size>=4,'insufficient image diversity at level '+level);
}
const assetsDir=new URL('public/voorzetsels-assets/',root);
await mkdir(assetsDir,{recursive:true});
const assetNames=[...new Set(items.map(item=>item.art))].sort();
for(const name of assetNames){
  const prefix='"'+name+'":"data:image/webp;base64,';
  const start=source.indexOf(prefix);
  assert(start>=0,'source image missing: '+name);
  const offset=start+prefix.length,end=source.indexOf('"',offset);
  assert(end>offset,'invalid source image: '+name);
  const encoded=source.slice(offset,end);
  assert(/^[A-Za-z0-9+/]+={0,2}$/.test(encoded),'invalid WebP base64: '+name);
  const bytes=Buffer.from(encoded,'base64');
  assert(bytes.length>=2000&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP',
    'image payload is not WebP: '+name);
  await writeFile(new URL(name,assetsDir),bytes);
}
const bank=JSON.stringify(items).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const html=template.replace('__ITEMS__',bank);
assert(!html.includes('__ITEMS__'),'unreplaced item-bank marker');
await writeFile(new URL('public/voorzetsels-test.html',root),html,'utf8');
console.log('Zinbo prepositions test built: '+items.length+' items / 4 levels / '+assetNames.length+' reused WebP images (no live-content changes).');
