#!/usr/bin/env python3
import argparse, copy, hashlib, json, pathlib, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
EXPECTED_RECEIPT_HASH_CONTRACT={
    'algorithm':'SHA-256',
    'canonicalization':'METACORE_CANONICAL_JSON_V1',
    'excluded_fields':['receipt_sha256']
}
SUITE_HASH_CONTRACT='METACORE_DELTA_SUITE_V1'
SAFE_EXECUTION_POLICY={'tools':'NONE','network':'NONE','filesystem':'NONE','private_route_selection':False}
ALLOWED_MODES={'QUICK_DELTA','BREAK_METACORE','CONTEXT_STRESS','BRING_YOUR_AI'}
ALLOWED_EXPERIMENT_CLASSES={'CONTROLLED_DELTA','OBSERVATIONAL_DELTA'}


def load(p):
    return json.loads(pathlib.Path(p).read_text(encoding='utf-8'))

def canonical_json_bytes(d):
    return json.dumps(d,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode('utf-8')

def sha_bytes(b):
    return 'sha256:'+hashlib.sha256(b).hexdigest()

def sha_obj(d):
    return sha_bytes(canonical_json_bytes(d))

def test_index_rows():
    return load(ROOT/'tests/index.json')['tests']

def metric_registry():
    return load(ROOT/'metrics/index.json')

def metric_ids():
    return {m['metric_id'] for m in metric_registry()['metrics']}

def test_row(test_id):
    for row in test_index_rows():
        if row['id']==test_id:
            return row
    raise SystemExit('TEST_NOT_FOUND')

def capsule_for(test_id):
    row=test_row(test_id)
    return load(ROOT/'tests'/row['path'])

def capsule_hash(test_id):
    return sha_obj(capsule_for(test_id))

def validate_capsule(d, path='capsule'):
    errs=[]
    required={'id','capsule_version','mode','experiment_class','risk_class','input','metrics','expected_observables','execution_policy'}
    missing=required-set(d)
    if missing: errs.append(f'{path}: MISSING_FIELDS {sorted(missing)}')
    if d.get('mode') not in ALLOWED_MODES: errs.append(f'{path}: INVALID_MODE')
    if d.get('experiment_class') not in ALLOWED_EXPERIMENT_CLASSES: errs.append(f'{path}: INVALID_EXPERIMENT_CLASS')
    if d.get('risk_class')!='SAFE_TEXT_ONLY': errs.append(f'{path}: RISK_CLASS_NOT_SAFE_TEXT_ONLY')
    if d.get('execution_policy')!=SAFE_EXECUTION_POLICY: errs.append(f'{path}: EXECUTION_POLICY_NOT_FAIL_CLOSED')
    inp=d.get('input')
    if isinstance(inp,str):
        if not inp or len(inp)>20000 or '\x00' in inp: errs.append(f'{path}: INVALID_TEXT_INPUT')
    elif isinstance(inp,list):
        if not inp or len(inp)>32: errs.append(f'{path}: INVALID_MESSAGE_COUNT')
        else:
            for i,row in enumerate(inp):
                if not isinstance(row,dict) or set(row)!={'role','content'} or row.get('role') not in {'user','assistant'} or not isinstance(row.get('content'),str) or len(row['content'])>8000 or '\x00' in row['content']:
                    errs.append(f'{path}: INVALID_MESSAGE_{i}')
    else: errs.append(f'{path}: INVALID_INPUT_TYPE')
    metrics=d.get('metrics')
    if not isinstance(metrics,list) or not metrics or len(metrics)>32 or len(metrics)!=len(set(metrics)):
        errs.append(f'{path}: INVALID_METRICS')
    observables=d.get('expected_observables')
    if not isinstance(observables,list) or not observables or len(observables)>32:
        errs.append(f'{path}: INVALID_EXPECTED_OBSERVABLES')
    return errs

def build_suite_manifest():
    mids=metric_ids()
    caps=[]
    seen=set()
    errs=[]
    for row in sorted(test_index_rows(),key=lambda x:x['id']):
        p=ROOT/'tests'/row['path']
        if not p.is_file():
            errs.append('TEST_MISSING '+row['path']); continue
        d=load(p)
        errs.extend(validate_capsule(d,row['path']))
        if d.get('id')!=row['id']: errs.append('TEST_ID_MISMATCH '+row['path'])
        if row['id'] in seen: errs.append('TEST_ID_DUPLICATE '+row['id'])
        seen.add(row['id'])
        for m in d.get('metrics',[]):
            if m not in mids: errs.append(f'UNKNOWN_METRIC {row["id"]} {m}')
        caps.append({'id':row['id'],'path':row['path'],'sha256':sha_obj(d)})
    if errs:
        raise SystemExit('\n'.join(errs))
    payload={
      'id':'metacore_delta_public_suite',
      'version':load(ROOT/'tests/index.json').get('version','unknown'),
      'hash_contract':SUITE_HASH_CONTRACT,
      'metric_registry_sha256':sha_obj(metric_registry()),
      'capsule_schema_sha256':sha_obj(load(ROOT/'specs/capsule.schema.json')),
      'capsules':caps,
    }
    out=copy.deepcopy(payload)
    out['suite_sha256']=sha_obj(payload)
    return out

def verify_suite_manifest(path=None):
    p=pathlib.Path(path) if path else ROOT/'suite/TEST_SUITE_MANIFEST.json'
    existing=load(p)
    computed=build_suite_manifest()
    if existing!=computed:
        raise SystemExit('SUITE_MANIFEST_MISMATCH')
    print('SUITE_MANIFEST_PASS',existing['suite_sha256'])
    return existing

def write_suite_manifest(path=None):
    p=pathlib.Path(path) if path else ROOT/'suite/TEST_SUITE_MANIFEST.json'
    p.parent.mkdir(parents=True,exist_ok=True)
    d=build_suite_manifest()
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('SUITE_MANIFEST_WRITTEN',d['suite_sha256'])

def canonical_receipt_bytes(d):
    x=copy.deepcopy(d); x.pop('receipt_sha256',None)
    return canonical_json_bytes(x)

def receipt_hash(d):
    return sha_bytes(canonical_receipt_bytes(d))

def verify_receipt(path, verify_provenance=True):
    d=load(path)
    if d.get('receipt_hash_contract')!=EXPECTED_RECEIPT_HASH_CONTRACT:
        raise SystemExit('RECEIPT_HASH_CONTRACT_MISMATCH')
    got=receipt_hash(d); exp=d.get('receipt_sha256')
    if got!=exp:
        raise SystemExit(f'RECEIPT_HASH_FAIL expected={exp} computed={got}')
    if verify_provenance:
        suite=build_suite_manifest()
        if d.get('suite_sha256')!=suite['suite_sha256']:
            raise SystemExit('RECEIPT_SUITE_HASH_MISMATCH')
        if d.get('metric_registry_sha256')!=suite['metric_registry_sha256']:
            raise SystemExit('RECEIPT_METRIC_REGISTRY_HASH_MISMATCH')
        if d.get('capsule_sha256')!=capsule_hash(d.get('test_id')):
            raise SystemExit('RECEIPT_CAPSULE_HASH_MISMATCH')
    print('RECEIPT_HASH_PASS',got)

def cmd_hash(path,write=False):
    p=pathlib.Path(path); d=load(p); d['receipt_hash_contract']=EXPECTED_RECEIPT_HASH_CONTRACT; h=receipt_hash(d)
    if write:
        d['receipt_sha256']=h; p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(h)


def challenge_registry():
    return load(ROOT/'challenges/index.json')

def contact_routes():
    return load(ROOT/'engagement/CONTACT_ROUTES.json')['routes']

def challenge_row(challenge_id):
    for row in challenge_registry()['challenges']:
        if row.get('id')==challenge_id:
            return row
    raise SystemExit('CHALLENGE_NOT_FOUND')

def verify_challenges():
    tests={r['id'] for r in test_index_rows()}
    seen=set(); errs=[]
    for ch in challenge_registry().get('challenges',[]):
        cid=ch.get('id')
        if not isinstance(cid,str) or not cid: errs.append('CHALLENGE_ID_INVALID'); continue
        if cid in seen: errs.append('CHALLENGE_ID_DUPLICATE '+cid)
        seen.add(cid)
        caps=ch.get('capsules')
        if not isinstance(caps,list) or not caps: errs.append('CHALLENGE_CAPSULES_INVALID '+cid); continue
        for tid in caps:
            if tid not in tests: errs.append(f'CHALLENGE_UNKNOWN_TEST {cid} {tid}')
    if errs: raise SystemExit('\n'.join(errs))
    return len(seen)

def metric_delta_rows(receipt):
    rows=[]
    for mid,data in sorted((receipt.get('metrics') or {}).items()):
        rows.append({
          'metric_id':mid,
          'baseline':data.get('baseline'),
          'metacore':data.get('metacore'),
          'method':data.get('method'),
          'evaluator_type':data.get('evaluator_type'),
          'confidence_milli':data.get('confidence_milli')
        })
    return rows

def passport_markdown(receipt):
    routes=contact_routes(); rows=metric_delta_rows(receipt)
    lines=[
      '# MetaCore DELTA Passport','',
      f"- Run: `{receipt.get('run_id')}`",
      f"- Capsule: `{receipt.get('test_id')}`",
      f"- Experiment class: `{receipt.get('experiment_class')}`",
      f"- Receipt: `{receipt.get('receipt_sha256')}`",
      f"- Suite: `{receipt.get('suite_sha256')}`",
      f"- Capsule hash: `{receipt.get('capsule_sha256')}`",
      f"- Evaluation blinded: `{receipt.get('evaluation_blinded')}`",'',
      '## Observable DELTA','',
      '| Metric | Baseline | MetaCore | Method |','|---|---|---|---|'
    ]
    for row in rows:
        lines.append(f"| `{row['metric_id']}` | {row['baseline']} | {row['metacore']} | {row['method']} |")
    lines += ['', '## Limitations','']
    for item in receipt.get('limitations',[]): lines.append('- '+str(item))
    lines += [
      '', '## Next path','',
      f"- Found a failure / want evaluator integration: `{routes['developer']['email']}`",
      f"- Want a scoped workflow pilot: `{routes['pilot']['email']}`",
      f"- Operator / group path: {routes['operator_network']['url']}",
      f"- Talk to MetaCore / Quantara: {routes['quantara_chat']['url']}",
      '', '> This Passport summarizes a verified receipt. It is evidence about the stated run and conditions, not a universal product-quality claim.'
    ]
    return '\n'.join(lines)+'\n'

def handoff_markdown(receipt,lane,goal):
    routes=contact_routes()
    route_map={'developer':'developer','pilot':'pilot','business':'business','general':'general','network':'operator_network'}
    if lane not in route_map: raise SystemExit('INVALID_HANDOFF_LANE')
    route=routes[route_map[lane]]
    target=route.get('email') or route.get('url')
    goal=goal.strip()
    if not goal or len(goal)>1000 or '\x00' in goal: raise SystemExit('INVALID_HANDOFF_GOAL')
    lines=[
      '# MetaCore DELTA technical handoff','',
      f"Route: {target}",
      f"Goal: {goal}",'',
      'Verified evidence:',
      f"- test: `{receipt.get('test_id')}`",
      f"- experiment: `{receipt.get('experiment_class')}`",
      f"- receipt: `{receipt.get('receipt_sha256')}`",
      f"- suite: `{receipt.get('suite_sha256')}`",'',
      'What changed:'
    ]
    for row in metric_delta_rows(receipt):
        lines.append(f"- `{row['metric_id']}`: {row['baseline']} → {row['metacore']} ({row['method']})")
    lines += ['', 'Please do not attach credentials, private keys, production secrets or sensitive customer data to the first contact.']
    return '\n'.join(lines)+'\n'


def write_new_text(path,text,label):
    p=pathlib.Path(path)
    if p.exists() or p.is_symlink():
        raise SystemExit('OUTPUT_EXISTS')
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(text,encoding='utf-8')
    print(label,p)

def collaboration_intent_from(receipt,lane,goal,challenge_id=None):
    interest_map={
      'developer':'developer_integration','pilot':'private_lab_pilot','business':'business_deployment',
      'general':'research_collaboration','network':'operator_network'
    }
    source_map={
      'developer':'evaluation_integration_source','pilot':'private_lab_collaboration','business':'managed_operating_core_discussion',
      'general':'public_verification_only','network':'public_verification_only'
    }
    return {
      'interest':interest_map[lane],
      'receipt_sha256':receipt.get('receipt_sha256'),
      'challenge_id':challenge_id,
      'use_case_summary':goal,
      'current_environment_summary':None,
      'what_delta_should_prove':None,
      'source_access_interest':source_map[lane],
      'no_secrets_confirmed':True
    }

def write_challenge_kit(challenge_id,out_dir):
    ch=challenge_row(challenge_id)
    out=pathlib.Path(out_dir)
    if out.is_symlink(): raise SystemExit('OUTPUT_DIR_SYMLINK_BLOCKED')
    if out.exists() and not out.is_dir(): raise SystemExit('OUTPUT_PATH_NOT_DIRECTORY')
    if out.exists() and any(out.iterdir()): raise SystemExit('OUTPUT_DIR_NOT_EMPTY')
    out.mkdir(parents=True,exist_ok=True)
    (out/'capsules').mkdir()
    suite=build_suite_manifest(); registry=metric_registry(); by_metric={m['metric_id']:m for m in registry['metrics']}
    used=set(); rows=[]
    for tid in ch['capsules']:
        cap=capsule_for(tid); used.update(cap['metrics'])
        (out/'capsules'/f'{tid}.json').write_text(json.dumps(cap,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        rows.append({
          'test_id':tid,'capsule_sha256':capsule_hash(tid),'metrics':cap['metrics'],
          'baseline_output':None,'metacore_output':None,'evaluation_notes':None
        })
    metrics=[by_metric[m] for m in sorted(used)]
    (out/'METRICS.json').write_text(json.dumps({'metrics':metrics},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    worksheet={
      'challenge_id':ch['id'],'title':ch['title'],'suite_sha256':suite['suite_sha256'],
      'experiment_note':'Fill outputs only from a declared run. If material conditions differ, treat the comparison as observational.',
      'capsules':rows,
      'share_warning':'Review outputs before sharing. Remove credentials, private customer data and unnecessary proprietary material.'
    }
    (out/'WORKSHEET.json').write_text(json.dumps(worksheet,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    manifest={
      'id':'metacore_delta_challenge_kit_v1','challenge_id':ch['id'],'suite_sha256':suite['suite_sha256'],
      'capsules':[{'id':tid,'sha256':capsule_hash(tid)} for tid in ch['capsules']],
      'metric_registry_sha256':suite['metric_registry_sha256']
    }
    (out/'SOURCE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (out/'README.md').write_text(
      f"# {ch['title']}\n\n{ch['question']}\n\n"
      '1. Read each capsule before running it.\n'
      '2. Keep materially matched conditions for a controlled comparison.\n'
      '3. Record outputs in `WORKSHEET.json` or separate local files.\n'
      '4. Evaluate only the included public metrics.\n'
      '5. Preserve limitations and disagreement.\n'
      '6. If the result is interesting, generate a verified DELTA Passport/Proof Bundle when a receipt is available.\n\n'
      'This kit runs no model, opens no network connection and contains no private MetaCore implementation.\n',encoding='utf-8')
    print('CHALLENGE_KIT_WRITTEN',out)

def write_proof_bundle(receipt_path,lane,goal,out_dir,challenge_id=None):
    verify_receipt(receipt_path,True)
    receipt=load(receipt_path)
    # Build/validate all text before creating files so a bad argument leaves no partial bundle.
    passport=passport_markdown(receipt)
    handoff=handoff_markdown(receipt,lane,goal)
    intent=collaboration_intent_from(receipt,lane,goal.strip(),challenge_id)
    out=pathlib.Path(out_dir)
    if out.is_symlink():
        raise SystemExit('OUTPUT_DIR_SYMLINK_BLOCKED')
    if out.exists() and not out.is_dir():
        raise SystemExit('OUTPUT_PATH_NOT_DIRECTORY')
    if out.exists() and any(out.iterdir()):
        raise SystemExit('OUTPUT_DIR_NOT_EMPTY')
    out.mkdir(parents=True,exist_ok=True)
    (out/'DELTA_RECEIPT.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (out/'DELTA_PASSPORT.md').write_text(passport,encoding='utf-8')
    (out/'HANDOFF.md').write_text(handoff,encoding='utf-8')
    (out/'COLLABORATION_INTENT.json').write_text(json.dumps(intent,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (out/'README.md').write_text(
      '# MetaCore DELTA Proof Bundle\n\n'
      'This local bundle contains the verified receipt, a Passport summary, a technical handoff and a no-secrets collaboration-intent template. '
      'It was generated locally and was not transmitted by the tool. Review every file before sharing it.\n',encoding='utf-8')
    print('PROOF_BUNDLE_WRITTEN',out)

def start_profile(profile):
    profiles={
      'developer':('TRUST-GAUNTLET','Probe uncertainty, authority boundaries and prompt injection.','developer'),
      'agent-builder':('CONTEXT-GAUNTLET','Probe correction retention, failure recovery and source freshness.','developer'),
      'operator':('CONTEXT-GAUNTLET','Probe operational continuity and failure truthfulness.','pilot'),
      'human-ai':('HUMAN-GAUNTLET','Probe agency, non-manipulation and human-context boundaries.','pilot'),
      'researcher':('GROUNDING-GAUNTLET','Probe evidence classes, uncertainty and analogy-vs-mechanism grounding.','developer'),
      'integrator':('TRUST-GAUNTLET','Start with trust boundaries, then move to source/integration scope.','developer'),
    }
    if profile not in profiles: raise SystemExit('INVALID_START_PROFILE')
    challenge_id,why,lane=profiles[profile]
    routes=contact_routes(); route_key={'developer':'developer','pilot':'pilot'}[lane]
    target=routes[route_key].get('email') or routes[route_key].get('url')
    lines=[
      f'METACORE DELTA START :: {profile}',
      f'RECOMMENDED_CHALLENGE={challenge_id}',
      f'WHY={why}',
      '',
      '1) Inspect:',
      f'   python3 tools/delta_lab.py challenge-show {challenge_id}',
      '2) Create a local challenge kit:',
      f'   python3 tools/delta_lab.py challenge-kit {challenge_id} --output-dir ./{challenge_id.lower()}-kit',
      '3) When you have a verified receipt, generate a Passport / Proof Bundle.',
      f'4) If the result matters, route the technical conversation to {target}.',
      '5) For source/integration depth, read SOURCE_ACCESS.md.',
      '',
      'No private MetaCore source, credentials or live runtime access are required to start.'
    ]
    return '\n'.join(lines)+'\n'

def check():
    required=[
      'README.md','START_HERE.md','CHALLENGES.md','SOURCE_ACCESS.md','JOIN_THE_LAB.md','IP_BOUNDARY.md','GROUNDING.md','SECURITY_MODEL.md','METHODOLOGY.md','CAPSULES.md','PROOF_MODEL.md','CONTRIBUTING_TESTS.md','delta_manifest.json',
      'specs/request.schema.json','specs/result.schema.json','specs/metric.schema.json','specs/receipt.schema.json','specs/conditions.schema.json','specs/capsule.schema.json','specs/suite-manifest.schema.json',
      'metrics/index.json','tests/index.json','suite/TEST_SUITE_MANIFEST.json','challenges/index.json','engagement/CONTACT_ROUTES.json','specs/collaboration-intent.schema.json'
    ]
    errs=[]
    for rel in required:
        if not (ROOT/rel).is_file(): errs.append('MISSING '+rel)
    for p in ROOT.rglob('*'):
        if p.is_symlink(): errs.append('SYMLINK '+str(p.relative_to(ROOT)))
        if p.is_file() and p.suffix=='.json':
            try: load(p)
            except Exception as e: errs.append(f'JSON_INVALID {p.relative_to(ROOT)} {e}')
    try: verify_suite_manifest()
    except SystemExit as e: errs.append(str(e))
    try: verify_challenges()
    except SystemExit as e: errs.append(str(e))
    try: verify_receipt(ROOT/'examples/delta_receipt.example.json')
    except SystemExit as e: errs.append(str(e))
    if errs:
        print('\n'.join(errs)); raise SystemExit(1)
    suite=build_suite_manifest()
    print('DELTA_PUBLIC_CHECK_PASS')
    print('TESTS',len(suite['capsules']))
    print('METRICS',len(metric_ids()))
    print('CHALLENGES',verify_challenges())
    print('SUITE',suite['suite_sha256'])

def main():
    ap=argparse.ArgumentParser(description='MetaCore DELTA Lab public local verifier')
    sub=ap.add_subparsers(dest='cmd',required=True)
    sub.add_parser('check')
    sub.add_parser('list-tests')
    s=sub.add_parser('show-test'); s.add_argument('test_id')
    s=sub.add_parser('capsule-hash'); s.add_argument('test_id')
    sub.add_parser('suite-hash')
    sub.add_parser('write-suite')
    s=sub.add_parser('hash-receipt'); s.add_argument('path'); s.add_argument('--write',action='store_true')
    s=sub.add_parser('verify-receipt'); s.add_argument('path'); s.add_argument('--hash-only',action='store_true')
    s=sub.add_parser('start'); s.add_argument('--profile',choices=['developer','agent-builder','operator','human-ai','researcher','integrator'],default='developer')
    sub.add_parser('challenge-list')
    s=sub.add_parser('challenge-show'); s.add_argument('challenge_id')
    s=sub.add_parser('challenge-kit'); s.add_argument('challenge_id'); s.add_argument('--output-dir',required=True)
    s=sub.add_parser('passport'); s.add_argument('receipt'); s.add_argument('--output')
    s=sub.add_parser('handoff'); s.add_argument('receipt'); s.add_argument('--lane',choices=['developer','pilot','business','general','network'],default='developer'); s.add_argument('--goal',required=True); s.add_argument('--output')
    sub.add_parser('routes')
    s=sub.add_parser('proof-bundle'); s.add_argument('receipt'); s.add_argument('--lane',choices=['developer','pilot','business','general','network'],default='developer'); s.add_argument('--goal',required=True); s.add_argument('--challenge-id'); s.add_argument('--output-dir',required=True)
    a=ap.parse_args()
    if a.cmd=='check': check()
    elif a.cmd=='list-tests':
        for r in test_index_rows(): print(r['id'],r['path'])
    elif a.cmd=='show-test': print(json.dumps(capsule_for(a.test_id),ensure_ascii=False,indent=2))
    elif a.cmd=='capsule-hash': print(capsule_hash(a.test_id))
    elif a.cmd=='suite-hash': print(build_suite_manifest()['suite_sha256'])
    elif a.cmd=='write-suite': write_suite_manifest()
    elif a.cmd=='hash-receipt': cmd_hash(a.path,a.write)
    elif a.cmd=='verify-receipt': verify_receipt(a.path,not a.hash_only)
    elif a.cmd=='start': print(start_profile(a.profile),end='')
    elif a.cmd=='challenge-list':
        for ch in challenge_registry()['challenges']:
            print(ch['id'],f"{ch.get('time_minutes')}m",ch.get('title'))
    elif a.cmd=='challenge-show':
        ch=challenge_row(a.challenge_id)
        print(json.dumps({'challenge':ch,'capsules':[capsule_for(t) for t in ch['capsules']]},ensure_ascii=False,indent=2))
    elif a.cmd=='challenge-kit': write_challenge_kit(a.challenge_id,a.output_dir)
    elif a.cmd=='passport':
        verify_receipt(a.receipt,True); d=load(a.receipt); text=passport_markdown(d)
        if a.output: write_new_text(a.output,text,'PASSPORT_WRITTEN')
        else: print(text,end='')
    elif a.cmd=='handoff':
        verify_receipt(a.receipt,True); d=load(a.receipt); text=handoff_markdown(d,a.lane,a.goal)
        if a.output: write_new_text(a.output,text,'HANDOFF_WRITTEN')
        else: print(text,end='')
    elif a.cmd=='routes':
        print(json.dumps(contact_routes(),ensure_ascii=False,indent=2))
    elif a.cmd=='proof-bundle':
        if a.challenge_id is not None: challenge_row(a.challenge_id)
        write_proof_bundle(a.receipt,a.lane,a.goal,a.output_dir,a.challenge_id)
if __name__=='__main__': main()
