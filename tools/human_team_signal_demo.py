#!/usr/bin/env python3
"""Reference implementation for DELTA browser-local Human/Team signal demos."""
import argparse, json

SAFETY_WORDS=['violence','violent','threat','threaten','unsafe','coercion','coerce','harassment','bullying','self-harm','suicide','smurt','grasin','nesaug','prievart','savižud','patyč','priekabi','угроз','насил','небезопас','домог','травл']
TEAM_META={
 'decision':{'label':'decision clarity','mechanism':'Decisions stall when it is unclear who has the final word or when a decision counts as closed.','action':'Define decision gates: who initiates, approves, executes and closes.','question':'Who can say “decision made”, and what observable event closes it?'},
 'ownership':{'label':'ownership clarity','mechanism':'Ownership friction rises when roles overlap but no one clearly owns the next action.','action':'Use one explicit owner per active issue and separate owner from observers.','question':'Which one responsibility needs one owner instead of several partial owners?'},
 'communication':{'label':'communication friction','mechanism':'Information gets lost when channel, timing, handoff or acknowledgement is unclear.','action':'Define a communication protocol: channel, response time, handoff and loop-back.','question':'Which handoff most often disappears without confirmation?'},
 'rhythm':{'label':'work rhythm','mechanism':'Problems surface late when there is no stable review/escalation/closure rhythm.','action':'Introduce a short recurring bottleneck review with explicit escalation and closure.','question':'Which recurring rhythm is missing so issues appear only in crisis?'}
}
def safety(text):
 t=str(text or '').lower(); return any(w in t for w in SAFETY_WORDS)
def human_loop(trigger,need,reaction,breaker='',step=''):
 trigger=trigger.strip(); breaker=breaker.strip(); step=step.strip()
 if not trigger: return {'status':'INVALID_INPUT','error':'Describe one concrete trigger moment.'}
 if safety(' '.join([trigger,need,reaction,breaker,step])):
  return {'status':'SAFETY_STOP','analysis_performed':False,'boundary':'Human safety overrides routine pattern optimization.'}
 return {'status':'OK_DEMO','provenance':'SELF_REPORT','map':{'trigger':trigger,'touched_need':need,'reaction':reaction,'breaker':breaker,'next_step':step},'next_question':('What has interrupted this loop even once, however briefly?' if not breaker else 'What is one small action you control that does not require the other person to change first?' if not step else 'After the next occurrence, what observable sign would tell you the loop changed?'),'boundary':'Structural self-report map only; not diagnosis, attachment classification or relationship prognosis.'}
def team_friction(team_type,stuck,decision,ownership,communication,rhythm,step=''):
 stuck=stuck.strip(); step=step.strip()
 if not stuck: return {'status':'INVALID_INPUT','error':'Describe one concrete operational bottleneck.'}
 if safety(stuck+' '+step): return {'status':'SAFETY_STOP','analysis_performed':False,'boundary':'Not HR assessment. Safety/harassment signals require responsible human review.'}
 vals={'decision':int(decision),'ownership':int(ownership),'communication':int(communication),'rhythm':int(rhythm)}
 if any(v not in {3,6,9} for v in vals.values()): return {'status':'INVALID_INPUT','error':'Dimension values must be 3, 6 or 9.'}
 score=sum(vals.values()); band='HIGH FRICTION' if score>=29 else 'MEDIUM FRICTION' if score>=21 else 'LOW FRICTION'
 dims=sorted(({'key':k,'value':v,**TEAM_META[k]} for k,v in vals.items()),key=lambda x:x['value'],reverse=True); top=dims[0]
 return {'status':'OK_DEMO','score':score,'range':'12..36','band':band,'bottleneck':{'key':top['key'],'label':top['label'],'value':top['value'],'mechanism':top['mechanism'],'action':top['action'],'question':top['question']},'secondary_signal':{'key':dims[1]['key'],'label':dims[1]['label'],'value':dims[1]['value']},'next_improvement':step or 'not provided','boundary':'Operational team snapshot only; not HR assessment, employee profiling or performance rating.'}
def main():
 ap=argparse.ArgumentParser(); sub=ap.add_subparsers(dest='cmd',required=True)
 h=sub.add_parser('human'); h.add_argument('--trigger',required=True); h.add_argument('--need',required=True); h.add_argument('--reaction',required=True); h.add_argument('--breaker',default=''); h.add_argument('--step',default='')
 t=sub.add_parser('team'); t.add_argument('--team-type',default='project'); t.add_argument('--stuck',required=True); t.add_argument('--decision',type=int,required=True); t.add_argument('--ownership',type=int,required=True); t.add_argument('--communication',type=int,required=True); t.add_argument('--rhythm',type=int,required=True); t.add_argument('--step',default='')
 a=ap.parse_args(); out=human_loop(a.trigger,a.need,a.reaction,a.breaker,a.step) if a.cmd=='human' else team_friction(a.team_type,a.stuck,a.decision,a.ownership,a.communication,a.rhythm,a.step)
 print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
