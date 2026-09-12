#!/usr/bin/env python3
"""Reference router for the public DELTA Knowledge Topology demo. No network/API/model calls."""
import argparse,json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOPOLOGY=ROOT/'playground/knowledge-topology.json'
STOP={'the','and','for','with','from','into','what','which','when','where','how','why','are','is','of','to','or','a','an','in','on','about','claim','model'}

def tokens(text):
    xs=re.findall(r'[a-z0-9]+',str(text).lower())
    return [x for x in xs if len(x)>=2 and x not in STOP]

def similar(a,b):
    if a==b:return True
    if len(a)>=4 and len(b)>=4 and (a.startswith(b) or b.startswith(a)): return True
    return False

def route(query,topology=None):
    topology=topology or json.load(open(TOPOLOGY,encoding='utf-8'))
    q=' '.join(str(query).strip().split())
    if not q or len(q)>500: return {'status':'INVALID_INPUT','error':'Question must contain 1..500 characters.'}
    qtok=tokens(q); qnorm=' '.join(re.findall(r'[a-z0-9]+',q.lower()))
    region_by={r['id']:r for r in topology['regions']}
    # Strongest public behavior: canonical example route if the example phrase is present or all meaningful pattern tokens are present.
    for ex in topology.get('example_routes',[]):
        pnorm=' '.join(re.findall(r'[a-z0-9]+',ex['question_pattern'].lower()))
        ptok=tokens(ex['question_pattern'])
        if pnorm in qnorm or (ptok and all(any(similar(p,qx) for qx in qtok) for p in ptok)):
            ids=ex['route']
            return make_result(q,'EXAMPLE_ROUTE','HIGH',ids,topology,ex['reason'])
    scored=[]
    for r in topology['regions']:
        label=tokens(r['label']); topics=[tokens(x) for x in r.get('topics',[])]; summary=tokens(r.get('summary',''))
        flat_topics=[x for row in topics for x in row]
        score=0; hits=[]
        for qt in qtok:
            part=0
            if any(similar(qt,x) for x in label): part=max(part,4)
            if any(similar(qt,x) for x in flat_topics): part=max(part,3)
            if any(similar(qt,x) for x in summary): part=max(part,1)
            if part: score+=part; hits.append(qt)
        if score: scored.append((score,len(set(hits)),r['id']))
    scored.sort(reverse=True)
    if not scored:
        return {'status':'NO_CONFIDENT_ROUTE','query':q,'match_mode':'NONE','confidence':'LOW','route':[],'relations':[],'unknowns':['No public topology region matched strongly enough.'],'boundary':'Topology suggests where to look; it does not answer or prove the question.'}
    selected=[]
    for score,hitcount,rid in scored:
        if rid not in selected: selected.append(rid)
        if len(selected)>=3: break
    # If only one match, add one directly related region as a useful conceptual hop.
    if len(selected)==1:
        rid=selected[0]
        for rel in topology['relations']:
            other=None
            if rel['from']==rid: other=rel['to']
            elif rel['to']==rid: other=rel['from']
            if other and other not in selected:
                selected.append(other); break
    confidence='HIGH' if scored[0][0]>=8 else 'MEDIUM' if scored[0][0]>=4 else 'LOW'
    reason='Matched public region labels/topics; adjacent regions are added only as conceptual hops.'
    return make_result(q,'TOKEN_ROUTE',confidence,selected,topology,reason)

def make_result(q,mode,confidence,ids,topology,reason):
    region_by={r['id']:r for r in topology['regions']}
    route_rows=[]
    for rid in ids:
        if rid in region_by:
            r=region_by[rid]
            route_rows.append({'id':rid,'label':r['label'],'epistemic_class':r['epistemic_class'],'summary':r['summary']})
    relations=[]
    chosen={x['id'] for x in route_rows}
    for rel in topology['relations']:
        if rel['from'] in chosen and rel['to'] in chosen:
            relations.append({k:rel[k] for k in ('from','to','relation','why')})
    return {'status':'OK_DEMO','query':q,'match_mode':mode,'confidence':confidence,'route':route_rows,'relations':relations,'reason':reason,'boundary':'Topology is orientation, not factual proof. Source-specific claims still require source evidence; symbolic/interpretive regions are not promoted to empirical fact.','runtime':{'model_called':False,'private_api_called':False,'token_required':False}}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('query'); a=ap.parse_args(); print(json.dumps(route(a.query),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
