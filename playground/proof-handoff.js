(()=>{
'use strict';
const $=s=>document.querySelector(s), pretty=x=>JSON.stringify(x,null,2);
let latestReceipt=null, latestHandoff=null;

function sorted(value){
  if(Array.isArray(value)) return value.map(sorted);
  if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,sorted(value[k])]));
  return value;
}
function canonical(value){return JSON.stringify(sorted(value))}
async function sha256(text){
  if(!globalThis.crypto?.subtle) throw new Error('WEB_CRYPTO_UNAVAILABLE');
  const bytes=new TextEncoder().encode(text), digest=await crypto.subtle.digest('SHA-256',bytes);
  return 'sha256:'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
function observedFor(id,payload){
  const r=payload?.result||{}, q=payload?.request||{};
  if(id==='unknown') return {epistemic_class:r.epistemic_class};
  if(id==='authority') return {decision:r.decision};
  if(id==='knowledge') return {route:(r.route||[]).map(x=>x.id)};
  if(id==='state') return {changed_paths:(r.changed||[]).map(x=>x.path),added_paths:(r.added||[]).map(x=>x.path)};
  if(id==='team') return {score:r.score,band:r.band,bottleneck:r.bottleneck?.key};
  if(id==='signal') return {birth_time:q.birth_time,birth_time_class:q.birth_time_class,precision_gate:r.precision_gate?.state};
  return {status:r.status||'UNKNOWN'};
}
function matchesExpected(observed,expected){return canonical(observed)===canonical(expected)}
function artifactName(prefix,id){return `${prefix}-${String(id||'experiment').replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()}.json`}
function downloadJSON(name,obj){
  const blob=new Blob([pretty(obj)+'\n'],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download=name;a.hidden=true;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
}
async function copyValue(text,status){
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text)}else{const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.hidden=true;document.body.appendChild(t);t.hidden=false;t.select();document.execCommand('copy');t.remove()} if(status)status.textContent='Copied locally.';return true}catch(e){if(status){status.textContent='Copy failed — use the JSON box or download button.';status.classList.add('error')}return false}
}
function receiptSummary(exp,receipt){return `${exp.title} · ${receipt.verdict} · ${exp.instrument}`}
async function buildReceipt(detail){
  const exp=detail?.experiment, preset=detail?.preset, payload=detail?.payload;
  if(!exp||!preset||!payload?.result) return null;
  const observed=observedFor(exp.id,payload), expected=exp.expected||{}, verdict=matchesExpected(observed,expected)?'PASS':'FAIL';
  const inputHash=await sha256(canonical(preset)), observedHash=await sha256(canonical(observed));
  const body={
    id:'metacore_context_lab_receipt_v1',receipt_version:'1.0.0',generated_at:new Date().toISOString(),
    surface:'https://delta.metacore.lt/context-lab/',experiment_manifest_version:window.MCExperiments?.version||'unknown',
    experiment_id:exp.id,instrument:exp.instrument,input_sha256:inputHash,observed_sha256:observedHash,
    observed,expected,verdict,boundary:exp.boundary,
    runtime:{browser_local:true,private_runtime_calls:0,database_writes:0,network_submission:false,analytics:false,persistence:false},
    attestation:'LOCAL_SELF_CHECKSUM_ONLY_NOT_SERVER_SIGNED'
  };
  return {...body,receipt_sha256:await sha256(canonical(body))};
}
function renderReceipt(receipt,exp){
  latestReceipt=receipt; latestHandoff=null;
  const panel=$('#artifact-panel'); panel.hidden=false;
  $('#receipt-verdict').textContent=receipt.verdict; $('#receipt-summary').textContent=receiptSummary(exp,receipt); $('#receipt-hash').textContent=receipt.receipt_sha256; $('#receipt-json').textContent=pretty(receipt);
  $('#receipt-copy').disabled=false;$('#receipt-download').disabled=false;$('#handoff-generate').disabled=false;$('#handoff-copy').disabled=true;$('#handoff-download').disabled=true;$('#handoff-json').textContent=pretty({status:'LOCAL_DRAFT_NOT_GENERATED',receipt_sha256:receipt.receipt_sha256});
  const st=$('#handoff-status');st.textContent='Receipt ready. Add only the minimum context needed for a technical conversation.';st.classList.remove('error');
}
function secretLike(text){return /-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:ghp|github_pat|sk-[a-z0-9_-]{8,})\b|\b(?:api[_-]?key|password|passwd|secret|access[_-]?token)\s*[:=]\s*\S+/i.test(text)}
async function generateHandoff(){
  const st=$('#handoff-status');st.classList.remove('error');
  if(!latestReceipt){st.textContent='Run a guided experiment first.';st.classList.add('error');return}
  const goal=$('#handoff-goal').value.trim(), constraints=$('#handoff-constraints').value.trim(), env=$('#handoff-env').value, next=$('#handoff-next').value, confirmed=$('#handoff-no-secrets').checked;
  if(!goal){st.textContent='Describe the real workflow or goal first.';st.classList.add('error');return}
  if(!confirmed){st.textContent='Confirm the no-secrets boundary before generating a handoff.';st.classList.add('error');return}
  if(secretLike(goal+'\n'+constraints)){st.textContent='Credential-like material detected. Remove secrets before generating the handoff.';st.classList.add('error');return}
  const contact=next==='pilot'?'projects@metacore.lt':'creator@metacore.lt';
  const body={
    id:'metacore_context_lab_handoff_v1',version:'1.0.0',generated_at:new Date().toISOString(),
    experiment_id:latestReceipt.experiment_id,receipt_sha256:latestReceipt.receipt_sha256,
    environment:env,desired_next_step:next,workflow_goal:goal,constraints:constraints||'not provided',
    no_secrets_confirmed:true,contact_route:contact,
    boundary:'LOCAL_DRAFT_ONLY_NOT_SUBMITTED_BY_PAGE',
    sharing_note:'Review this draft before sharing. Source/LAB access remains scoped and is never granted by a receipt.'
  };
  latestHandoff={...body,handoff_sha256:await sha256(canonical(body))};
  $('#handoff-json').textContent=pretty(latestHandoff);$('#handoff-copy').disabled=false;$('#handoff-download').disabled=false;st.textContent=`Local handoff ready. Suggested route: ${contact}`;
}
function bindArtifacts(){
  const st=$('#handoff-status');
  $('#receipt-copy').onclick=()=>latestReceipt&&copyValue(pretty(latestReceipt)+'\n',st);
  $('#receipt-download').onclick=()=>latestReceipt&&downloadJSON(artifactName('metacore-delta-receipt',latestReceipt.experiment_id),latestReceipt);
  $('#handoff-generate').onclick=()=>generateHandoff().catch(()=>{st.textContent='Could not generate local handoff.';st.classList.add('error')});
  $('#handoff-copy').onclick=()=>latestHandoff&&copyValue(pretty(latestHandoff)+'\n',st);
  $('#handoff-download').onclick=()=>latestHandoff&&downloadJSON(artifactName('metacore-technical-handoff',latestReceipt?.experiment_id),latestHandoff);
}
document.addEventListener('metacore:experiment-result',e=>buildReceipt(e.detail).then(r=>r&&renderReceipt(r,e.detail.experiment)).catch(()=>{const st=$('#handoff-status');if(st){st.textContent='Local receipt hashing is unavailable in this browser.';st.classList.add('error')}}));
document.addEventListener('DOMContentLoaded',bindArtifacts);
})();
