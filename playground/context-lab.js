(()=>{
'use strict';
const $=s=>document.querySelector(s), pretty=x=>JSON.stringify(x,null,2);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function confidenceBand(v){return v>=.75?'HIGH':v>=.45?'MEDIUM':'LOW'}
function avg(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}
function copyText(id){navigator.clipboard?.writeText($(id).textContent||'')}
window.mcCopy=copyText;

function contextCompile(){
  const req={operation:'context_compile',signals:[
    {theme:$('#cc-theme1').value,strength:clamp($('#cc-s1').value),relevance:clamp($('#cc-r1').value),source_confidence:clamp($('#cc-c1').value),timing:clamp($('#cc-t1').value),human_context:clamp($('#cc-h1').value)},
    {theme:$('#cc-theme2').value,strength:clamp($('#cc-s2').value),relevance:clamp($('#cc-r2').value),source_confidence:clamp($('#cc-c2').value),timing:clamp($('#cc-t2').value),human_context:clamp($('#cc-h2').value)},
    {theme:$('#cc-theme3').value,strength:clamp($('#cc-s3').value),relevance:clamp($('#cc-r3').value),source_confidence:clamp($('#cc-c3').value),timing:clamp($('#cc-t3').value),human_context:clamp($('#cc-h3').value)}
  ]};
  const scored=req.signals.map((x,i)=>({...x,id:`signal_${i+1}`,weight:+(x.strength*x.relevance*x.source_confidence*x.timing*x.human_context).toFixed(4)}));
  const themes={}; for(const s of scored)(themes[s.theme]??=[]).push(s);
  const theme_weights={}; for(const [k,v] of Object.entries(themes)){const top=v.map(x=>x.weight).sort((a,b)=>b-a).slice(0,3);theme_weights[k]=+avg(top).toFixed(4)}
  const conf=avg(scored.map(x=>x.source_confidence));
  const strongest=Object.entries(theme_weights).sort((a,b)=>b[1]-a[1])[0]||['none',0];
  const res={status:'OK_DEMO',algorithm:'PUBLIC_CONTEXT_WEIGHT_V1',theme_weights,strongest_theme:{theme:strongest[0],weight:strongest[1]},confidence_band:confidenceBand(conf),unknowns:scored.filter(x=>x.source_confidence<.45).map(x=>x.id),next_prompt:`What evidence or human confirmation would most change the ${strongest[0]} interpretation?`,boundary:'Context aid only; not diagnosis, fate or private MetaCore runtime output.'};
  $('#cc-req').textContent=pretty(req); $('#cc-res').textContent=pretty(res);
}

function flatten(obj,prefix='',out={}){if(obj&&typeof obj==='object'&&!Array.isArray(obj)){for(const k of Object.keys(obj).sort())flatten(obj[k],prefix?`${prefix}.${k}`:k,out)}else out[prefix]=obj;return out}
function stateDelta(){let before,after; try{before=JSON.parse($('#sd-before').value);after=JSON.parse($('#sd-after').value)}catch(e){$('#sd-res').textContent=pretty({status:'INVALID_JSON',error:'Parse the before/after fields as JSON.'});return}
 const a=flatten(before),b=flatten(after),keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort(); const added=[],removed=[],changed=[],unchanged=[];
 for(const k of keys){if(!(k in a))added.push({path:k,value:b[k]});else if(!(k in b))removed.push({path:k,previous:a[k]});else if(JSON.stringify(a[k])!==JSON.stringify(b[k]))changed.push({path:k,before:a[k],after:b[k]});else unchanged.push(k)}
 const req={operation:'state_delta',before,after}; const res={status:'OK_DEMO',added,removed,changed,unchanged_count:unchanged.length,writeback_proposal:{apply:false,reason:'Demo reports DELTA; it never mutates source state.'}};
 $('#sd-req').textContent=pretty(req);$('#sd-res').textContent=pretty(res)}

function epistemicRoute(){const req={operation:'epistemic_route',source_type:$('#er-source').value,freshness:$('#er-fresh').value,directly_supported:$('#er-direct').value==='yes',material_missing:$('#er-missing').value==='yes'};let cls,why;
 if(req.material_missing){cls='MISSING_DATA';why='Material information needed for the claim is missing.'}
 else if(req.source_type==='symbolic'){cls='SYMBOLIC_REFLECTION';why='The input is explicitly symbolic/reflective.'}
 else if(req.source_type==='current_measurement'&&req.freshness==='current'&&req.directly_supported){cls='FACT_CURRENT';why='Current measurement directly supports the statement.'}
 else if(req.source_type==='workspace_record'&&req.directly_supported){cls='FACT_WORKSPACE';why='A workspace record directly supports the statement.'}
 else if(['external_source','user_report'].includes(req.source_type)&&req.directly_supported){cls='SOURCE_DERIVED';why='The statement is attributed to a source rather than promoted to universal fact.'}
 else if(req.source_type==='model_inference'&&req.directly_supported){cls='INFERENCE';why='The statement is reasoned from evidence but not directly observed.'}
 else {cls='HYPOTHESIS';why='Support is indirect, stale, unknown or insufficient for a stronger class.'}
 const res={status:'OK_DEMO',epistemic_class:cls,why,language_hint:cls==='HYPOTHESIS'?'Present as a testable possibility, not a fact.':cls==='SYMBOLIC_REFLECTION'?'Present as a reflective lens, not physical proof.':'Keep provenance visible.'};$('#er-req').textContent=pretty(req);$('#er-res').textContent=pretty(res)}

function authorityCheck(){const req={operation:'authority_check',actor_type:$('#ag-actor').value,authenticated:$('#ag-auth').value==='yes',delegated_mandate:$('#ag-mandate').value==='yes',scope_match:$('#ag-scope').value==='yes',impact:$('#ag-impact').value,approval_policy:$('#ag-approval').value};const reasons=[];let decision='ALLOW';
 if(!req.authenticated){decision='BLOCK';reasons.push('Actor is not authenticated.')}
 if(decision!=='BLOCK'&&req.actor_type!=='human'&&!req.delegated_mandate){decision='BLOCK';reasons.push('Non-human actor has no delegated mandate.')}
 if(decision!=='BLOCK'&&!req.scope_match){decision='BLOCK';reasons.push('Requested action is outside scoped authority.')}
 if(decision!=='BLOCK'&&(req.impact==='high_consequence'||(req.impact==='external_effect'&&req.approval_policy==='required'))){decision='NEEDS_APPROVAL';reasons.push('Policy requires approval before this impact class.')}
 if(!reasons.length)reasons.push('Authenticated actor, mandate/scope and approval boundary are satisfied for the selected demo case.');
 const res={status:'OK_DEMO',decision,reasons,principle:'Dignity is universal; authority is scoped.',automatic_execution:false};$('#ag-req').textContent=pretty(req);$('#ag-res').textContent=pretty(res)}


const symbolicThemes={1:'initiative / self-direction',2:'relation / sensitivity',3:'expression / creation',4:'structure / method',5:'change / adaptation',6:'responsibility / care',7:'inquiry / reflection',8:'stewardship / material organization',9:'integration / wider perspective'};
function digitSum(n){return String(Math.abs(Number(n)||0)).split('').reduce((a,c)=>a+(Number(c)||0),0)}
function reduceNumber(n){let x=Math.abs(Number(n)||0);while(x>9&&![11,22,33].includes(x))x=digitSum(x);return x}
function parseBirthDate(v){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||''); if(!m)return null;
 const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]); const x=new Date(y,mo-1,d);
 if(x.getFullYear()!==y||x.getMonth()!==mo-1||x.getDate()!==d)return null;
 const today=new Date(); today.setHours(23,59,59,999); if(x>today||y<1900)return null;
 return {y,mo,d,iso:v};
}
function psychomatrixPreview(date){
 const raw=`${String(date.y).padStart(4,'0')}${String(date.mo).padStart(2,'0')}${String(date.d).padStart(2,'0')}`;
 const dateDigits=raw.split('').map(Number); const A=dateDigits.reduce((a,b)=>a+b,0); const B=digitSum(A);
 const dayDigits=String(date.d).padStart(2,'0').split('').map(Number); const firstDayDigit=dayDigits.find(n=>n!==0)||0;
 const C=A-(2*firstDayDigit); const D=digitSum(C);
 const all=[...dateDigits,...String(A).split('').map(Number),...String(B).split('').map(Number),...String(C).split('').map(Number),...String(D).split('').map(Number)].filter(n=>n>=1&&n<=9);
 const counts={}; for(let i=1;i<=9;i++)counts[i]=0; for(const n of all)counts[n]++;
 const active=Object.keys(counts).filter(k=>counts[k]>0).map(Number); const missing=Object.keys(counts).filter(k=>counts[k]===0).map(Number);
 const max=Math.max(...Object.values(counts)); const dominant=max?Object.keys(counts).filter(k=>counts[k]===max).map(Number):[];
 const repetition=Object.values(counts).reduce((a,c)=>a+Math.max(0,c-1),0);
 return {algorithm:'PUBLIC_PYTHAGOREAN_STYLE_PSYCHOMATRIX_PREVIEW_V1',working_numbers:{A,B,C,D},main_number:reduceNumber(A),counts,active_numbers:active,missing_numbers:missing,dominant_digits:dominant,repetition_score:repetition,matrix_density:+(active.length/9).toFixed(3),boundary:'Symbolic/numerological reflection only; not psychometric assessment, diagnosis or personality measurement.'};
}
function renderMatrix(matrix){
 const host=$('#ps-matrix'); host.textContent=''; const order=[1,4,7,2,5,8,3,6,9];
 for(const n of order){const cell=document.createElement('div');cell.className='num-cell '+(matrix.counts[n]?'active':'missing');const digit=document.createElement('span');digit.className='digit';digit.textContent=String(n);const reps=document.createElement('span');reps.className='reps';reps.textContent=matrix.counts[n]?String(n).repeat(Math.min(matrix.counts[n],5)):'—'; if(matrix.counts[n]>5)reps.textContent=String(n).repeat(5)+` ×${matrix.counts[n]}`;cell.append(digit,reps);host.appendChild(cell)}
}
function personalReflection(matrix){
 const dom=matrix.dominant_digits.slice(0,3); const miss=matrix.missing_numbers.slice(0,3);
 const foreground=dom.length?dom.map(n=>symbolicThemes[n]).join(', '):'no single repeated theme';
 const open=miss.length?miss.map(n=>symbolicThemes[n]).join(', '):'no empty matrix positions';
 return {title:dom.length?`Symbolic emphasis: ${dom.join(' · ')}`:'Balanced symbolic spread',text:`This public symbolic model foregrounds ${foreground}. Open positions can be used as reflection questions around ${open}. Treat this as a prompt for inquiry, not a statement about who you are.`};
}
function showPersonalError(msg){
 let e=$('#ps-error'); if(!e){e=document.createElement('div');e.id='ps-error';e.className='personal-error';$('.personal-input').appendChild(e)} e.textContent=msg;
}
function clearPersonalError(){const e=$('#ps-error');if(e)e.remove()}
function buildPersonalSeed(){
 clearPersonalError(); const date=parseBirthDate($('#ps-date').value); const city=$('#ps-city').value.trim(); const timeKnown=$('#ps-time-known').checked; const time=timeKnown?$('#ps-time').value:'12:00';
 if(!date){showPersonalError('Enter a valid birth date between 1900 and today.');return}
 if(!city||city.length<2||city.length>100){showPersonalError('Enter a birth city (2–100 characters).');return}
 if(timeKnown&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)){showPersonalError('Enter a valid birth time.');return}
 const matrix=psychomatrixPreview(date); const reflection=personalReflection(matrix); const precision=timeKnown?'USER_PROVIDED_TIME':'ASSUMED_NOON';
 const request={operation:'personal_seed',birth_date:date.iso,birth_city:city,birth_time:time,birth_time_class:precision};
 const gate=timeKnown?{state:'ELIGIBLE_FOR_LIVE_CALCULATION',withheld_in_this_demo:['city geocoding','timezone resolution','astronomical positions','natal angles/houses'],note:'Time was user-provided, but this anonymous page still performs no live astronomical calculation.'}:{state:'TIME_SENSITIVE_ASTRO_BLOCKED',withheld:['exact Ascendant','exact houses','time-sensitive Moon/angle precision'],note:'12:00 is a demo assumption, not a verified birth time. MetaCore keeps that uncertainty visible.'};
 const result={status:'OK_DEMO',provenance:{birth_date:'USER_PROVIDED',birth_city:'USER_PROVIDED_UNVERIFIED_TEXT',birth_time:precision,location_resolution:'DEFERRED_NOT_GEOCODED',symbolic_matrix:'SYMBOLIC_DERIVED',personality:'UNKNOWN_NOT_INFERRED'},symbolic_matrix:matrix,reflection,precision_gate:gate,privacy:{network_transmission:false,persistence:false,cookies:false,local_storage:false},next_layer:{available_after_separate_gate:['city/timezone resolution','astronomical calculation','temporal cycles','context profile','live AI treatment'],called_now:false}};
 $('#ps-empty').hidden=true; $('#ps-results').hidden=false; renderMatrix(matrix);
 $('#ps-main').textContent=matrix.main_number; $('#ps-density').textContent=Math.round(matrix.matrix_density*100)+'%'; $('#ps-repeat').textContent=matrix.repetition_score; $('#ps-precision').textContent=precision;
 $('#ps-active').textContent=matrix.active_numbers.join(' · ')||'—'; $('#ps-missing').textContent=matrix.missing_numbers.join(' · ')||'none'; $('#ps-dominant').textContent=matrix.dominant_digits.join(' · ')||'none';
 $('#ps-reflection-title').textContent=reflection.title; $('#ps-reflection').textContent=reflection.text; $('#ps-gate').textContent=gate.state; $('#ps-gate-note').textContent=gate.note;
 $('#ps-prov-date').textContent=date.iso; $('#ps-prov-city').textContent=city; $('#ps-prov-time').textContent=time; $('#ps-time-class').textContent=timeKnown?'USER':'ASSUMED';
 $('#ps-req').textContent=pretty(request); $('#ps-res').textContent=pretty(result);
}
function togglePersonalTime(){const known=$('#ps-time-known').checked;const input=$('#ps-time');input.disabled=!known;if(!known)input.value='12:00';$('#ps-time-label').textContent=known?'USER PROVIDED':'12:00 · DEMO DEFAULT';$('#ps-time-label').className=known?'':'assumption'}
function samplePersonal(){const now=new Date();$('#ps-date').value='1990-01-01';$('#ps-city').value='Vilnius';$('#ps-time-known').checked=false;togglePersonalTime();buildPersonalSeed()}
function clearPersonal(){clearPersonalError();$('#ps-date').value='';$('#ps-city').value='';$('#ps-time-known').checked=false;togglePersonalTime();$('#ps-empty').hidden=false;$('#ps-results').hidden=true;$('#ps-prov-date').textContent='birth date';$('#ps-prov-city').textContent='city';$('#ps-prov-time').textContent='12:00';$('#ps-time-class').textContent='ASSUMED';$('#ps-req').textContent=pretty({status:'WAITING_FOR_LOCAL_INPUT'});$('#ps-res').textContent=pretty({network_transmission:false,persistence:false})}
function bindPersonal(){
 const date=$('#ps-date'); if(date){const t=new Date(),pad=n=>String(n).padStart(2,'0');date.max=`${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`}
 $('#ps-time-known').onchange=togglePersonalTime; $('#ps-run').onclick=buildPersonalSeed; $('#ps-sample').onclick=samplePersonal; $('#ps-clear').onclick=clearPersonal; togglePersonalTime();
}

function bind(){
 $('#cc-run').onclick=contextCompile; $('#sd-run').onclick=stateDelta; $('#er-run').onclick=epistemicRoute; $('#ag-run').onclick=authorityCheck;
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyText(b.dataset.copy));
 bindPersonal(); contextCompile();stateDelta();epistemicRoute();authorityCheck();
}
document.addEventListener('DOMContentLoaded',bind);
})();
