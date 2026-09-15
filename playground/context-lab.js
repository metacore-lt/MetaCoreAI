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
function stateDelta(){let before,after; try{before=JSON.parse($('#sd-before').value);after=JSON.parse($('#sd-after').value)}catch(e){const error={status:'INVALID_JSON',error:'Parse the before/after fields as JSON.'};$('#sd-res').textContent=pretty(error);return {request:null,result:error}}
 const a=flatten(before),b=flatten(after),keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort(); const added=[],removed=[],changed=[],unchanged=[];
 for(const k of keys){if(!(k in a))added.push({path:k,value:b[k]});else if(!(k in b))removed.push({path:k,previous:a[k]});else if(JSON.stringify(a[k])!==JSON.stringify(b[k]))changed.push({path:k,before:a[k],after:b[k]});else unchanged.push(k)}
 const req={operation:'state_delta',before,after}; const res={status:'OK_DEMO',added,removed,changed,unchanged_count:unchanged.length,writeback_proposal:{apply:false,reason:'Demo reports DELTA; it never mutates source state.'}};
 $('#sd-req').textContent=pretty(req);$('#sd-res').textContent=pretty(res);return {request:req,result:res}}

function loadSpatialStateSample(){
 const before={domain:'spatial_qa',source_truth_locked:true,target_layer:'reference_profile_fit',landmark_rms_mm:4.2,symmetry_error_mm:2.2,containment_violations:0,unresolved_collisions:1,joint_continuity:'pass',candidate_state:'BLOCKED',production_write:false};
 const after={domain:'spatial_qa',source_truth_locked:true,target_layer:'reference_profile_fit',landmark_rms_mm:4.2,symmetry_error_mm:2.2,containment_violations:0,unresolved_collisions:0,joint_continuity:'pass',candidate_state:'READY_FOR_HUMAN_QA',production_write:false,promotion_gate:'HUMAN_QA_REQUIRED'};
 $('#sd-before').value=pretty(before);$('#sd-after').value=pretty(after);return stateDelta()
}

function epistemicRoute(){const req={operation:'epistemic_route',source_type:$('#er-source').value,freshness:$('#er-fresh').value,directly_supported:$('#er-direct').value==='yes',material_missing:$('#er-missing').value==='yes'};let cls,why;
 if(req.material_missing){cls='MISSING_DATA';why='Material information needed for the claim is missing.'}
 else if(req.source_type==='symbolic'){cls='SYMBOLIC_REFLECTION';why='The input is explicitly symbolic/reflective.'}
 else if(req.source_type==='current_measurement'&&req.freshness==='current'&&req.directly_supported){cls='FACT_CURRENT';why='Current measurement directly supports the statement.'}
 else if(req.source_type==='workspace_record'&&req.directly_supported){cls='FACT_WORKSPACE';why='A workspace record directly supports the statement.'}
 else if(['external_source','user_report'].includes(req.source_type)&&req.directly_supported){cls='SOURCE_DERIVED';why='The statement is attributed to a source rather than promoted to universal fact.'}
 else if(req.source_type==='model_inference'&&req.directly_supported){cls='INFERENCE';why='The statement is reasoned from evidence but not directly observed.'}
 else {cls='HYPOTHESIS';why='Support is indirect, stale, unknown or insufficient for a stronger class.'}
 const res={status:'OK_DEMO',epistemic_class:cls,why,language_hint:cls==='HYPOTHESIS'?'Present as a testable possibility, not a fact.':cls==='SYMBOLIC_REFLECTION'?'Present as a reflective lens, not physical proof.':'Keep provenance visible.'};$('#er-req').textContent=pretty(req);$('#er-res').textContent=pretty(res);return {request:req,result:res}}

function authorityCheck(){const req={operation:'authority_check',actor_type:$('#ag-actor').value,authenticated:$('#ag-auth').value==='yes',delegated_mandate:$('#ag-mandate').value==='yes',scope_match:$('#ag-scope').value==='yes',impact:$('#ag-impact').value,approval_policy:$('#ag-approval').value};const reasons=[];let decision='ALLOW';
 if(!req.authenticated){decision='BLOCK';reasons.push('Actor is not authenticated.')}
 if(decision!=='BLOCK'&&req.actor_type!=='human'&&!req.delegated_mandate){decision='BLOCK';reasons.push('Non-human actor has no delegated mandate.')}
 if(decision!=='BLOCK'&&!req.scope_match){decision='BLOCK';reasons.push('Requested action is outside scoped authority.')}
 if(decision!=='BLOCK'&&(req.impact==='high_consequence'||(req.impact==='external_effect'&&req.approval_policy==='required'))){decision='NEEDS_APPROVAL';reasons.push('Policy requires approval before this impact class.')}
 if(!reasons.length)reasons.push('Authenticated actor, mandate/scope and approval boundary are satisfied for the selected demo case.');
 const res={status:'OK_DEMO',decision,reasons,principle:'Dignity is universal; authority is scoped.',automatic_execution:false};$('#ag-req').textContent=pretty(req);$('#ag-res').textContent=pretty(res);return {request:req,result:res}}


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
 $('#ps-req').textContent=pretty(request); $('#ps-res').textContent=pretty(result); return {request,result};
}
function togglePersonalTime(){const known=$('#ps-time-known').checked;const input=$('#ps-time');input.disabled=!known;if(!known)input.value='12:00';$('#ps-time-label').textContent=known?'USER PROVIDED':'12:00 · DEMO DEFAULT';$('#ps-time-label').className=known?'':'assumption'}
function samplePersonal(){const now=new Date();$('#ps-date').value='1990-01-01';$('#ps-city').value='Vilnius';$('#ps-time-known').checked=false;togglePersonalTime();buildPersonalSeed()}
function clearPersonal(){clearPersonalError();$('#ps-date').value='';$('#ps-city').value='';$('#ps-time-known').checked=false;togglePersonalTime();$('#ps-empty').hidden=false;$('#ps-results').hidden=true;$('#ps-prov-date').textContent='birth date';$('#ps-prov-city').textContent='city';$('#ps-prov-time').textContent='12:00';$('#ps-time-class').textContent='ASSUMED';$('#ps-req').textContent=pretty({status:'WAITING_FOR_LOCAL_INPUT'});$('#ps-res').textContent=pretty({network_transmission:false,persistence:false})}
function bindPersonal(){
 const date=$('#ps-date'); if(date){const t=new Date(),pad=n=>String(n).padStart(2,'0');date.max=`${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`}
 $('#ps-time-known').onchange=togglePersonalTime; $('#ps-run').onclick=buildPersonalSeed; $('#ps-sample').onclick=samplePersonal; $('#ps-clear').onclick=clearPersonal; togglePersonalTime();
}


const safetyWords=['violence','violent','threat','threaten','unsafe','coercion','coerce','harassment','bullying','self-harm','suicide','smurt','grasin','nesaug','prievart','savižud','patyč','priekabi','угроз','насил','небезопас','домог','травл'];
function hasSafetySignal(text){const t=String(text||'').toLowerCase();return safetyWords.some(w=>t.includes(w))}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function renderHumanLoopResult(res){const host=$('#hl-result');host.textContent='';
 if(res.status==='SAFETY_STOP'){host.append(el('strong','signal-stop-title','Safety boundary'));host.append(el('span','signal-stop-copy','This demo stops ordinary pattern analysis here. If there is immediate danger, use local emergency services or a trusted responsible human.'));host.className='signal-result-placeholder signal-stop';return}
 const flow=el('div','loop-flow'); for(const [k,v] of [['TRIGGER',res.map.trigger],['TOUCHES',res.map.touched_need],['REACTION',res.map.reaction],['BREAKER',res.map.breaker||'not provided'],['NEXT STEP',res.map.next_step||'not provided']]){const item=el('div','loop-node');item.append(el('small','',k),el('b','',v));flow.append(item)}host.append(flow);host.append(el('p','signal-next-question',res.next_question));host.className='signal-result-placeholder active'}
function runHumanLoop(){
 const req={operation:'human_loop',trigger:$('#hl-trigger').value.trim(),touched_need:$('#hl-need').value,reaction:$('#hl-reaction').value,breaker:$('#hl-breaker').value.trim(),next_step:$('#hl-step').value.trim()};
 if(!req.trigger){const out={status:'INVALID_INPUT',error:'Describe one concrete trigger moment.'};$('#hl-json').textContent=pretty(out);return}
 const safety=hasSafetySignal(Object.values(req).join(' '));
 const res=safety?{status:'SAFETY_STOP',analysis_performed:false,boundary:'Human safety overrides routine pattern optimization.'}:{status:'OK_DEMO',provenance:'SELF_REPORT',map:{trigger:req.trigger,touched_need:req.touched_need,reaction:req.reaction,breaker:req.breaker,next_step:req.next_step},next_question:!req.breaker?'What has interrupted this loop even once, however briefly?':!req.next_step?'What is one small action you control that does not require the other person to change first?':'After the next occurrence, what observable sign would tell you the loop changed?',boundary:'Structural self-report map only; not diagnosis, attachment classification or relationship prognosis.'};
 renderHumanLoopResult(res);$('#hl-json').textContent=pretty({request:req,result:res,privacy:{network:false,persistence:false}})
}
function clearHumanLoop(){for(const id of ['#hl-trigger','#hl-breaker','#hl-step'])$(id).value='';$('#hl-need').selectedIndex=0;$('#hl-reaction').selectedIndex=0;const host=$('#hl-result');host.className='signal-result-placeholder';host.textContent='';host.append(el('strong','', 'No label. No diagnosis.'),el('span','', 'Only a structural map of the self-reported loop.'));$('#hl-json').textContent=pretty({status:'WAITING_FOR_LOCAL_INPUT'})}

const teamMeta={
 decision:{label:'decision clarity',mechanism:'Decisions stall when it is unclear who has the final word or when a decision counts as closed.',action:'Define decision gates: who initiates, approves, executes and closes.',question:'Who can say “decision made”, and what observable event closes it?'},
 ownership:{label:'ownership clarity',mechanism:'Ownership friction rises when roles overlap but no one clearly owns the next action.',action:'Use one explicit owner per active issue and separate owner from observers.',question:'Which one responsibility needs one owner instead of several partial owners?'},
 communication:{label:'communication friction',mechanism:'Information gets lost when channel, timing, handoff or acknowledgement is unclear.',action:'Define a communication protocol: channel, response time, handoff and loop-back.',question:'Which handoff most often disappears without confirmation?'},
 rhythm:{label:'work rhythm',mechanism:'Problems surface late when there is no stable review/escalation/closure rhythm.',action:'Introduce a short recurring bottleneck review with explicit escalation and closure.',question:'Which recurring rhythm is missing so issues appear only in crisis?'}
};
function renderTeamResult(res){const host=$('#tf-result');host.textContent='';
 if(res.status==='SAFETY_STOP'){host.append(el('strong','signal-stop-title','Human review required'));host.append(el('span','signal-stop-copy','Threat, harassment, bullying or safety language should not be reduced to team-optimization scoring. Route to a responsible manager, HR, mediator, legal/safety function or emergency support as appropriate.'));host.className='signal-result-placeholder signal-stop';return}
 const head=el('div','team-snapshot-head');head.append(el('small','',`FRICTION ${res.score}/36 · ${res.band}`),el('strong','',`Bottleneck: ${res.bottleneck.label}`));host.append(head);host.append(el('p','',res.bottleneck.mechanism));const q=el('div','team-question');q.append(el('small','', 'NEXT QUESTION'),el('b','',res.bottleneck.question));host.append(q);const a=el('div','team-action');a.append(el('small','', 'OPERATOR ACTION'),el('b','',res.bottleneck.action));host.append(a);host.className='signal-result-placeholder active'}
function runTeamFriction(){
 const req={operation:'team_friction',team_type:$('#tf-type').value,stuck:$('#tf-stuck').value.trim(),decision:+$('#tf-decision').value,ownership:+$('#tf-ownership').value,communication:+$('#tf-communication').value,rhythm:+$('#tf-rhythm').value,next_improvement:$('#tf-step').value.trim()};
 if(!req.stuck){const out={status:'INVALID_INPUT',error:'Describe one concrete operational bottleneck.'};$('#tf-json').textContent=pretty(out);return}
 if(hasSafetySignal(req.stuck+' '+req.next_improvement)){const res={status:'SAFETY_STOP',analysis_performed:false,boundary:'Not HR assessment. Safety/harassment signals require responsible human review.'};renderTeamResult(res);$('#tf-json').textContent=pretty({request:req,result:res,privacy:{network:false,persistence:false}});return {request:req,result:res}}
 const score=req.decision+req.ownership+req.communication+req.rhythm;const band=score>=29?'HIGH FRICTION':score>=21?'MEDIUM FRICTION':'LOW FRICTION';
 const dims=['decision','ownership','communication','rhythm'].map(k=>({key:k,value:req[k],...teamMeta[k]})).sort((a,b)=>b.value-a.value);const top=dims[0];
 const res={status:'OK_DEMO',score,range:'12..36',band,bottleneck:{key:top.key,label:top.label,value:top.value,mechanism:top.mechanism,action:top.action,question:top.question},secondary_signal:{key:dims[1].key,label:dims[1].label,value:dims[1].value},next_improvement:req.next_improvement||'not provided',boundary:'Operational team snapshot only; not HR assessment, employee profiling or performance rating.'};
 renderTeamResult(res);$('#tf-json').textContent=pretty({request:req,result:res,privacy:{network:false,persistence:false}});return {request:req,result:res}
}
function clearTeamFriction(){for(const id of ['#tf-stuck','#tf-step'])$(id).value='';for(const id of ['#tf-type','#tf-decision','#tf-ownership','#tf-communication','#tf-rhythm'])$(id).selectedIndex=0;const host=$('#tf-result');host.className='signal-result-placeholder';host.textContent='';host.append(el('strong','', 'Operations before psychology.'),el('span','', 'Decision · ownership · communication · rhythm.'));$('#tf-json').textContent=pretty({status:'WAITING_FOR_LOCAL_INPUT'})}
function bindHumanTeam(){
 $('#hl-run').onclick=runHumanLoop;$('#hl-clear').onclick=clearHumanLoop;$('#tf-run').onclick=runTeamFriction;$('#tf-clear').onclick=clearTeamFriction;
}


const ktStop=new Set(['the','and','for','with','from','into','what','which','when','where','how','why','are','is','of','to','or','a','an','in','on','about','claim','model']);
function ktTokens(text){return String(text||'').toLowerCase().match(/[a-z0-9]+/g)?.filter(x=>x.length>=2&&!ktStop.has(x))||[]}
function ktSimilar(a,b){return a===b||(a.length>=4&&b.length>=4&&(a.startsWith(b)||b.startsWith(a)))}
function ktMakeResult(query,mode,confidence,ids,topology,reason){
 const by=Object.fromEntries(topology.regions.map(r=>[r.id,r])); const route=ids.filter(id=>by[id]).map(id=>({id,label:by[id].label,epistemic_class:by[id].epistemic_class,summary:by[id].summary})); const chosen=new Set(route.map(x=>x.id));
 const relations=topology.relations.filter(r=>chosen.has(r.from)&&chosen.has(r.to)).map(r=>({from:r.from,to:r.to,relation:r.relation,why:r.why}));
 return {status:'OK_DEMO',query,match_mode:mode,confidence,route,relations,reason,boundary:'Topology is orientation, not factual proof. Source-specific claims still require source evidence; symbolic/interpretive regions are not promoted to empirical fact.',runtime:{model_called:false,private_api_called:false,token_required:false}};
}
function knowledgeRoute(query){
 const topology=window.MCKnowledgeTopology; const q=String(query||'').trim().replace(/\s+/g,' '); if(!topology)return {status:'DEMO_DATA_UNAVAILABLE'}; if(!q||q.length>500)return {status:'INVALID_INPUT',error:'Question must contain 1..500 characters.'};
 const qtok=ktTokens(q),qnorm=(q.toLowerCase().match(/[a-z0-9]+/g)||[]).join(' ');
 for(const ex of topology.example_routes||[]){const pnorm=(ex.question_pattern.toLowerCase().match(/[a-z0-9]+/g)||[]).join(' '),ptok=ktTokens(ex.question_pattern);const hit=qnorm.includes(pnorm)||(ptok.length&&ptok.every(p=>qtok.some(qx=>ktSimilar(p,qx))));if(hit)return ktMakeResult(q,'EXAMPLE_ROUTE','HIGH',ex.route,topology,ex.reason)}
 const scored=[];
 for(const r of topology.regions){const label=ktTokens(r.label),topics=(r.topics||[]).flatMap(ktTokens),summary=ktTokens(r.summary);let score=0,hits=[];for(const qt of qtok){let part=0;if(label.some(x=>ktSimilar(qt,x)))part=Math.max(part,4);if(topics.some(x=>ktSimilar(qt,x)))part=Math.max(part,3);if(summary.some(x=>ktSimilar(qt,x)))part=Math.max(part,1);if(part){score+=part;hits.push(qt)}}if(score)scored.push({score,hitcount:new Set(hits).size,id:r.id})}
 scored.sort((a,b)=>b.score-a.score||b.hitcount-a.hitcount||a.id.localeCompare(b.id));
 if(!scored.length)return {status:'NO_CONFIDENT_ROUTE',query:q,match_mode:'NONE',confidence:'LOW',route:[],relations:[],unknowns:['No public topology region matched strongly enough.'],boundary:'Topology suggests where to look; it does not answer or prove the question.'};
 const selected=[];for(const row of scored){if(!selected.includes(row.id))selected.push(row.id);if(selected.length>=3)break}
 if(selected.length===1){const rid=selected[0];for(const rel of topology.relations){const other=rel.from===rid?rel.to:rel.to===rid?rel.from:null;if(other&&!selected.includes(other)){selected.push(other);break}}}
 const confidence=scored[0].score>=8?'HIGH':scored[0].score>=4?'MEDIUM':'LOW';return ktMakeResult(q,'TOKEN_ROUTE',confidence,selected,topology,'Matched public region labels/topics; adjacent regions are added only as conceptual hops.');
}
function renderKnowledgeRoute(res){
 const host=$('#kt-route');host.textContent='';
 if(res.status!=='OK_DEMO'){const e=el('div','knowledge-empty',res.status==='NO_CONFIDENT_ROUTE'?'No confident public route. Try a more specific concept.':(res.error||'Knowledge map unavailable.'));host.append(e);return}
 res.route.forEach((r,i)=>{if(i){host.append(el('div','knowledge-arrow','→'))}const node=el('div','knowledge-node');node.append(el('small','',r.epistemic_class),el('strong','',r.label),el('span','',r.summary));host.append(node)});
}
function runKnowledgeRoute(){const q=$('#kt-query').value;const req={operation:'knowledge_route',query:q};const res=knowledgeRoute(q);$('#kt-req').textContent=pretty(req);$('#kt-res').textContent=pretty(res);renderKnowledgeRoute(res);return {request:req,result:res}}
function bindKnowledgeRoute(){
 $('#kt-run').onclick=runKnowledgeRoute;$('#kt-query').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runKnowledgeRoute()}});document.querySelectorAll('[data-kt]').forEach(b=>b.onclick=()=>{$('#kt-query').value=b.dataset.kt;runKnowledgeRoute()});runKnowledgeRoute();
}


function experimentRows(){return (window.MCExperiments&&Array.isArray(window.MCExperiments.experiments))?window.MCExperiments.experiments:[]}
function experimentById(id){return experimentRows().find(x=>x.id===id)||null}
function renderExperimentGallery(activeId){
 const host=$('#experiment-grid'); if(!host)return; host.textContent='';
 const rows=experimentRows(); if(!rows.length){host.append(el('div','experiment-loading','Experiment manifest unavailable.'));return}
 for(const x of rows){const a=el('a','experiment-card'+(x.id===activeId?' active':''));a.href=`?exp=${encodeURIComponent(x.id)}#${x.target}`;a.dataset.experiment=x.id;a.append(el('small','',x.category),el('strong','',x.title),el('span','',x.short),el('em','',`Try → ${x.instrument}`));host.append(a)}
}
function setSelect(id,value){const n=$(id);if(!n)return; n.value=String(value)}
function focusExperimentTarget(id){
 const target=document.getElementById(id);if(!target)return;target.classList.remove('experiment-focus');void target.offsetWidth;target.classList.add('experiment-focus');setTimeout(()=>target.classList.remove('experiment-focus'),1300)
}
function applyExperiment(id,{scroll=false}={}){
 const x=experimentById(id); if(!x)return false; const p=x.preset||{}; let payload=null;
 if(id==='unknown'){
   setSelect('#er-source',p.source_type);setSelect('#er-fresh',p.freshness);setSelect('#er-direct',p.directly_supported);setSelect('#er-missing',p.material_missing);payload=epistemicRoute();
 }else if(id==='authority'){
   setSelect('#ag-actor',p.actor_type);setSelect('#ag-auth',p.authenticated);setSelect('#ag-mandate',p.delegated_mandate);setSelect('#ag-scope',p.scope_match);setSelect('#ag-impact',p.impact);setSelect('#ag-approval',p.approval_policy);payload=authorityCheck();
 }else if(id==='knowledge'){
   $('#kt-query').value=p.query||'';payload=runKnowledgeRoute();
 }else if(id==='state'){
   $('#sd-before').value=pretty(p.before||{});$('#sd-after').value=pretty(p.after||{});payload=stateDelta();
 }else if(id==='team'){
   setSelect('#tf-type',p.team_type);$('#tf-stuck').value=p.stuck||'';setSelect('#tf-decision',p.decision);setSelect('#tf-ownership',p.ownership);setSelect('#tf-communication',p.communication);setSelect('#tf-rhythm',p.rhythm);$('#tf-step').value=p.next_improvement||'';payload=runTeamFriction();
 }else if(id==='signal'){
   $('#ps-date').value=p.birth_date||'';$('#ps-city').value=p.birth_city||'';$('#ps-time-known').checked=Boolean(p.birth_time);$('#ps-time').value=p.birth_time||'12:00';togglePersonalTime();payload=buildPersonalSeed();
 }else return false;
 renderExperimentGallery(id); const status=$('#experiment-status');if(status)status.textContent=`Loaded: ${x.title} · ${x.short}`;focusExperimentTarget(x.target);
 document.dispatchEvent(new CustomEvent('metacore:experiment-result',{detail:{experiment:x,preset:p,payload}}));
 if(scroll){const target=document.getElementById(x.target);if(target)target.scrollIntoView({behavior:'smooth',block:'start'})}
 return true;
}
function bindExperimentGallery(){
 const params=new URLSearchParams(window.location.search); const id=params.get('exp'); renderExperimentGallery(id);
 const host=$('#experiment-grid');if(host)host.addEventListener('click',e=>{const a=e.target.closest('[data-experiment]');if(!a)return;e.preventDefault();const exp=a.dataset.experiment;if(!applyExperiment(exp,{scroll:true}))return;const url=new URL(window.location.href);url.searchParams.set('exp',exp);url.hash=experimentById(exp).target;history.replaceState(null,'',url.pathname+url.search+url.hash)});
 if(id)applyExperiment(id,{scroll:false});
}

function bind(){
 $('#cc-run').onclick=contextCompile; $('#sd-run').onclick=stateDelta; $('#sd-spatial-sample').onclick=loadSpatialStateSample; $('#er-run').onclick=epistemicRoute; $('#ag-run').onclick=authorityCheck;
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyText(b.dataset.copy));
 bindPersonal(); bindHumanTeam(); bindKnowledgeRoute(); contextCompile();stateDelta();epistemicRoute();authorityCheck(); bindExperimentGallery();
}
document.addEventListener('DOMContentLoaded',bind);
})();
