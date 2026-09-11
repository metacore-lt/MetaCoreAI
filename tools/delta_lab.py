#!/usr/bin/env python3
import argparse, copy, hashlib, json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
EXPECTED_HASH_CONTRACT={'algorithm':'SHA-256','canonicalization':'METACORE_CANONICAL_JSON_V1','excluded_fields':['receipt_sha256']}

def load(p): return json.loads(pathlib.Path(p).read_text(encoding='utf-8'))
def canonical_receipt_bytes(d):
    x=copy.deepcopy(d); x.pop('receipt_sha256',None)
    return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode('utf-8')
def receipt_hash(d): return 'sha256:'+hashlib.sha256(canonical_receipt_bytes(d)).hexdigest()
def verify_receipt(path):
    d=load(path)
    if d.get('receipt_hash_contract')!=EXPECTED_HASH_CONTRACT: raise SystemExit('RECEIPT_HASH_CONTRACT_MISMATCH')
    got=receipt_hash(d); exp=d.get('receipt_sha256')
    if got!=exp: raise SystemExit(f'RECEIPT_HASH_FAIL expected={exp} computed={got}')
    print('RECEIPT_HASH_PASS',got)
def cmd_hash(path,write=False):
    p=pathlib.Path(path); d=load(p); d['receipt_hash_contract']=EXPECTED_HASH_CONTRACT; h=receipt_hash(d)
    if write:
        d['receipt_sha256']=h; p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(h)
def test_index(): return load(ROOT/'tests/index.json')['tests']
def metric_ids(): return {m['metric_id'] for m in load(ROOT/'metrics/index.json')['metrics']}
def check():
    required=['README.md','GROUNDING.md','SECURITY_MODEL.md','METHODOLOGY.md','delta_manifest.json','specs/request.schema.json','specs/result.schema.json','specs/metric.schema.json','specs/receipt.schema.json','specs/conditions.schema.json','metrics/index.json','tests/index.json']
    errs=[]
    for rel in required:
        if not (ROOT/rel).is_file(): errs.append('MISSING '+rel)
    for p in ROOT.rglob('*'):
        if p.is_symlink(): errs.append('SYMLINK '+str(p.relative_to(ROOT)))
        if p.is_file() and p.suffix=='.json':
            try: load(p)
            except Exception as e: errs.append(f'JSON_INVALID {p.relative_to(ROOT)} {e}')
    mids=metric_ids()
    seen=set()
    for row in test_index():
        p=ROOT/'tests'/row['path']
        if not p.is_file(): errs.append('TEST_MISSING '+row['path']); continue
        d=load(p)
        if d.get('id')!=row['id']: errs.append('TEST_ID_MISMATCH '+row['path'])
        if d['id'] in seen: errs.append('TEST_ID_DUPLICATE '+d['id'])
        seen.add(d['id'])
        for m in d.get('metrics',[]):
            if m not in mids: errs.append(f'UNKNOWN_METRIC {d["id"]} {m}')
    try: verify_receipt(ROOT/'examples/delta_receipt.example.json')
    except SystemExit as e: errs.append(str(e))
    if errs:
        print('\n'.join(errs)); raise SystemExit(1)
    print('DELTA_PUBLIC_CHECK_PASS')
    print('TESTS',len(seen)); print('METRICS',len(mids))
def main():
    ap=argparse.ArgumentParser(description='MetaCore DELTA Lab public local verifier')
    sub=ap.add_subparsers(dest='cmd',required=True)
    sub.add_parser('check'); sub.add_parser('list-tests')
    s=sub.add_parser('show-test'); s.add_argument('test_id')
    s=sub.add_parser('hash-receipt'); s.add_argument('path'); s.add_argument('--write',action='store_true')
    s=sub.add_parser('verify-receipt'); s.add_argument('path')
    a=ap.parse_args()
    if a.cmd=='check': check()
    elif a.cmd=='list-tests':
        for r in test_index(): print(r['id'],r['path'])
    elif a.cmd=='show-test':
        for r in test_index():
            if r['id']==a.test_id: print(json.dumps(load(ROOT/'tests'/r['path']),ensure_ascii=False,indent=2)); return
        raise SystemExit('TEST_NOT_FOUND')
    elif a.cmd=='hash-receipt': cmd_hash(a.path,a.write)
    elif a.cmd=='verify-receipt': verify_receipt(a.path)
if __name__=='__main__': main()
