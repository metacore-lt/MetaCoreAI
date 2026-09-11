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

function bind(){
 $('#cc-run').onclick=contextCompile; $('#sd-run').onclick=stateDelta; $('#er-run').onclick=epistemicRoute; $('#ag-run').onclick=authorityCheck;
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyText(b.dataset.copy));
 contextCompile();stateDelta();epistemicRoute();authorityCheck();
}
document.addEventListener('DOMContentLoaded',bind);
})();
