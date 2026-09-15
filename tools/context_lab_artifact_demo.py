#!/usr/bin/env python3
import argparse,hashlib,json
from pathlib import Path

def canonical(obj): return json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha(obj): return 'sha256:'+hashlib.sha256(canonical(obj).encode()).hexdigest()

def receipt(experiment_id,instrument,preset,observed,expected,boundary,generated_at='2026-09-15T00:00:00.000Z'):
    body={
      'id':'metacore_context_lab_receipt_v1','receipt_version':'1.0.0','generated_at':generated_at,
      'surface':'https://delta.metacore.lt/context-lab/','experiment_manifest_version':'1.0.0',
      'experiment_id':experiment_id,'instrument':instrument,'input_sha256':sha(preset),'observed_sha256':sha(observed),
      'observed':observed,'expected':expected,'verdict':'PASS' if canonical(observed)==canonical(expected) else 'FAIL','boundary':boundary,
      'runtime':{'browser_local':True,'private_runtime_calls':0,'database_writes':0,'network_submission':False,'analytics':False,'persistence':False},
      'attestation':'LOCAL_SELF_CHECKSUM_ONLY_NOT_SERVER_SIGNED'
    }
    return {**body,'receipt_sha256':sha(body)}

def handoff(receipt_obj,goal,environment='agent_or_app',next_step='evaluation',constraints='not provided',generated_at='2026-09-15T00:00:00.000Z'):
    contact='projects@metacore.lt' if next_step=='pilot' else 'creator@metacore.lt'
    body={'id':'metacore_context_lab_handoff_v1','version':'1.0.0','generated_at':generated_at,'experiment_id':receipt_obj['experiment_id'],'receipt_sha256':receipt_obj['receipt_sha256'],'environment':environment,'desired_next_step':next_step,'workflow_goal':goal,'constraints':constraints or 'not provided','no_secrets_confirmed':True,'contact_route':contact,'boundary':'LOCAL_DRAFT_ONLY_NOT_SUBMITTED_BY_PAGE','sharing_note':'Review this draft before sharing. Source/LAB access remains scoped and is never granted by a receipt.'}
    return {**body,'handoff_sha256':sha(body)}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--fixture',action='store_true'); a=ap.parse_args()
    preset={'actor_type':'ai_agent','authenticated':'yes','delegated_mandate':'no','scope_match':'yes','impact':'external_effect','approval_policy':'required'}
    expected={'decision':'BLOCK'}; observed={'decision':'BLOCK'}
    r=receipt('authority','authority_check',preset,observed,expected,'The demo evaluates declared scope/mandate fields; it does not execute any action.')
    h=handoff(r,'Evaluate authority boundaries in our deployment workflow.','agent_or_app','integration','No production credentials in this draft.')
    out={'receipt':r,'handoff':h}
    print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
