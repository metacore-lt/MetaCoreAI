#!/usr/bin/env python3
"""Browser-demo reference calculator. No network, no persistence, no private MetaCore runtime."""
import argparse, datetime as dt, json, re

THEMES={1:'initiative / self-direction',2:'relation / sensitivity',3:'expression / creation',4:'structure / method',5:'change / adaptation',6:'responsibility / care',7:'inquiry / reflection',8:'stewardship / material organization',9:'integration / wider perspective'}

def digit_sum(n:int)->int:
    return sum(int(c) for c in str(abs(int(n))))

def reduce_number(n:int)->int:
    n=abs(int(n))
    while n>9 and n not in {11,22,33}:
        n=digit_sum(n)
    return n

def parse_date(value:str)->dt.date:
    try: d=dt.date.fromisoformat(value)
    except Exception as e: raise SystemExit('INVALID_BIRTH_DATE') from e
    if d.year<1900 or d>dt.date.today(): raise SystemExit('INVALID_BIRTH_DATE_RANGE')
    return d

def validate_time(value:str)->str:
    if not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',value): raise SystemExit('INVALID_BIRTH_TIME')
    return value

def psychomatrix(date:dt.date)->dict:
    raw=f'{date.year:04d}{date.month:02d}{date.day:02d}'
    date_digits=[int(c) for c in raw]
    A=sum(date_digits); B=digit_sum(A)
    first_day_digit=next((int(c) for c in f'{date.day:02d}' if c!='0'),0)
    C=A-(2*first_day_digit); D=digit_sum(C)
    all_digits=date_digits+[int(c) for n in (A,B,C,D) for c in str(abs(n))]
    counts={i:0 for i in range(1,10)}
    for n in all_digits:
        if 1<=n<=9: counts[n]+=1
    active=[n for n,c in counts.items() if c>0]
    missing=[n for n,c in counts.items() if c==0]
    max_count=max(counts.values())
    dominant=[n for n,c in counts.items() if c==max_count] if max_count else []
    return {
      'algorithm':'PUBLIC_PYTHAGOREAN_STYLE_PSYCHOMATRIX_PREVIEW_V1',
      'working_numbers':{'A':A,'B':B,'C':C,'D':D},
      'main_number':reduce_number(A),'counts':counts,'active_numbers':active,'missing_numbers':missing,
      'dominant_digits':dominant,'repetition_score':sum(max(0,c-1) for c in counts.values()),
      'matrix_density':round(len(active)/9,3),
      'boundary':'Symbolic/numerological reflection only; not psychometric assessment, diagnosis or personality measurement.'
    }

def build(date_s:str,city:str,birth_time:str|None)->dict:
    date=parse_date(date_s); city=city.strip()
    if not 2<=len(city)<=100: raise SystemExit('INVALID_BIRTH_CITY')
    known=birth_time is not None
    time=validate_time(birth_time) if known else '12:00'
    matrix=psychomatrix(date)
    dom=matrix['dominant_digits'][:3]; missing=matrix['missing_numbers'][:3]
    foreground=', '.join(THEMES[n] for n in dom) if dom else 'no single repeated theme'
    open_themes=', '.join(THEMES[n] for n in missing) if missing else 'no empty matrix positions'
    return {
      'status':'OK_DEMO',
      'request':{'operation':'personal_seed','birth_date':date.isoformat(),'birth_city':city,'birth_time':time,'birth_time_class':'USER_PROVIDED_TIME' if known else 'ASSUMED_NOON'},
      'provenance':{'birth_date':'USER_PROVIDED','birth_city':'USER_PROVIDED_UNVERIFIED_TEXT','birth_time':'USER_PROVIDED_TIME' if known else 'ASSUMED_NOON','location_resolution':'DEFERRED_NOT_GEOCODED','symbolic_matrix':'SYMBOLIC_DERIVED','personality':'UNKNOWN_NOT_INFERRED'},
      'symbolic_matrix':matrix,
      'reflection':{'text':f'This public symbolic model foregrounds {foreground}. Open positions can be used as reflection questions around {open_themes}. Treat this as a prompt for inquiry, not a statement about who you are.'},
      'precision_gate':({'state':'ELIGIBLE_FOR_LIVE_CALCULATION','note':'Time was user-provided; this local demo still performs no astronomical calculation.'} if known else {'state':'TIME_SENSITIVE_ASTRO_BLOCKED','withheld':['exact Ascendant','exact houses','time-sensitive Moon/angle precision'],'note':'12:00 is a demo assumption, not a verified birth time.'}),
      'privacy':{'network_transmission':False,'persistence':False,'cookies':False,'local_storage':False}
    }

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--date',required=True); ap.add_argument('--city',required=True); ap.add_argument('--time'); a=ap.parse_args()
    print(json.dumps(build(a.date,a.city,a.time),ensure_ascii=False,indent=2))
if __name__=='__main__': main()
