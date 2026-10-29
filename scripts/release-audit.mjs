// Read-only release inventory. No approval, unlock or deployment side effects.
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const src=new URL('../src/html-parts/',import.meta.url);
const names=(await readdir(src)).filter(n=>/^part-\d{3}\.txt$/.test(n)).sort();
if(names.length!==15)throw Error('Expected 15 source segments');
const html=(await Promise.all(names.map(n=>readFile(new URL(n,src),'utf8')))).join('');
function embeddedJSON(token){
  let start=html.indexOf(token);
  if(start<0)throw Error('Missing '+token);
  start+=token.length;
  while(/\s/.test(html[start]))start++;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<html.length;i++){
    const c=html[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"'){quoted=true;continue;}
    if(c==='{'||c==='[')depth++;
    if(c==='}'||c===']')depth--;
    if(depth===0)return JSON.parse(html.slice(start,i+1));
  }
  throw Error('Incomplete JSON at '+token);
}
const v43=Object.values(embeddedJSON('const V43_CANDIDATES =')).flat();
const o3=embeddedJSON('const O3_PILOT =');
const vtt=embeddedJSON('const VTT_PILOT =');
const base=embeddedJSON('const ORDER =').length+embeddedJSON('const MORPH =').length+
  Object.values(embeddedJSON('const ADVANCED =')).reduce((sum,a)=>sum+a.length,0);
const dateValid=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'');
const completeReview=x=>x.reviewStatus==='human-approved'&&typeof x.reviewBy==='string'&&
  x.reviewBy.trim().length>1&&dateValid(x.reviewAt);
const completeImage=x=>x.imageReviewStatus==='premium-approved'&&
  typeof x.imageReviewBy==='string'&&x.imageReviewBy.trim().length>1&&dateValid(x.imageReviewAt);
const review=JSON.parse(await readFile(new URL('../docs/CONTENT_REVIEW_2026-10-28.json',import.meta.url),'utf8'));
const reviewedBanks={v43:embeddedJSON('const V43_CANDIDATES ='),o3,vtt};
const reviewMatches=Object.entries(reviewedBanks).every(([name,bank])=>
  review.banks?.[name]?.sha256===createHash('sha256').update(JSON.stringify(bank)).digest('hex') &&
  review.banks?.[name]?.items===(Array.isArray(bank)?bank.length:Object.values(bank).flat().length));
const approved=q=>reviewMatches||completeReview(q);
const approvedImage=q=>reviewMatches||completeImage(q);
const pendingReview=v43.filter(x=>!approved(x));
const pendingImage=v43.filter(x=>!approvedImage(x));
const pendingO3=o3.filter(x=>!approved(x));
const pendingVTT=vtt.filter(x=>!approved(x));
const resolutions=embeddedJSON('const V43_RESOLUTION_PASS =');
const technicalImageBlockers=v43.filter(q=>resolutions[q.art]!==true).map(q=>q.id);
const qaArtifacts=[
  ['testbanner',html.includes('id="qa-banner"')],
  ['QA-preview',html.includes('const QA_PREVIEW=true')],
  ['QA-launcher',html.includes('const QA_CHOOSER_HTML=')],
  ['QA-preview-item-notice',html.includes('<aside class="qa-item-notice"')]
].filter(([,v])=>v).map(([k])=>k);
const output={
  source:'repository, not an expert review',
  exercises:{existing:base,v43:v43.length,o3:o3.length,vtt:vtt.length,total:base+v43.length+o3.length+vtt.length},
  pending:{
    v43Grammatical:pendingReview.map(x=>x.id),
    v43Images:pendingImage.map(x=>x.id),
    o3:pendingO3.map(x=>x.id),vtt:pendingVTT.map(x=>x.id),
    technicalImageResolution:technicalImageBlockers,
    unresolvedProductionUX:qaArtifacts
  },
  ownerAttestation:{reviewer:review.reviewer,source:review.provenance.status,exactBanksVerified:reviewMatches,
    signedExpertReport:review.provenance.signedExpertRecord},
  childPilotEvidence:review.childPilot,
  liveReady:false
};
console.log(JSON.stringify(output,null,2));
process.exitCode=2; // fail closed: a report is never release authorization
