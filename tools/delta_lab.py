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

def check():
    required=[
      'README.md','GROUNDING.md','SECURITY_MODEL.md','METHODOLOGY.md','CAPSULES.md','PROOF_MODEL.md','CONTRIBUTING_TESTS.md','delta_manifest.json',
      'specs/request.schema.json','specs/result.schema.json','specs/metric.schema.json','specs/receipt.schema.json','specs/conditions.schema.json','specs/capsule.schema.json','specs/suite-manifest.schema.json',
      'metrics/index.json','tests/index.json','suite/TEST_SUITE_MANIFEST.json'
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
    try: verify_receipt(ROOT/'examples/delta_receipt.example.json')
    except SystemExit as e: errs.append(str(e))
    if errs:
        print('\n'.join(errs)); raise SystemExit(1)
    suite=build_suite_manifest()
    print('DELTA_PUBLIC_CHECK_PASS')
    print('TESTS',len(suite['capsules']))
    print('METRICS',len(metric_ids()))
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
if __name__=='__main__': main()
