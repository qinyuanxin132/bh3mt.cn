"""Build gentle web motions from the unmodified v16 desktop motion resources."""
import copy, hashlib, json, math
from pathlib import Path
root = Path(__file__).resolve().parent.parent / 'public/live2d/ling-v16'
def load(name): return json.loads((root / name).read_text())
def save(name, data): (root / name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
def values(curve, fn):
    a = curve['Segments']; a[1] = round(fn(a[1]),7); i=2
    while i < len(a):
        size = 7 if a[i] == 1 else 3
        for j in range(i+2,i+size,2): a[j] = round(fn(a[j]),7)
        i+=size

def curve(pid, duration, center, amplitude=0, period=None, phase=0):
    period = period or duration
    points=[(i/2, round(center+amplitude*math.sin(2*math.pi*(i/2)/period+phase),7)) for i in range(int(duration*2)+1)]
    segments=list(points[0])
    for t,v in points[1:]: segments += [0,t,v]
    return {'Target':'Parameter','Id':pid,'Segments':segments}
def finish(d):
    points=segments=0
    for c in d['Curves']:
        i=2;points+=1
        while i<len(c['Segments']):
            size=7 if c['Segments'][i]==1 else 3
            segments+=1;points+=3 if size==7 else 1;i+=size
    d['Meta'].update(CurveCount=len(d['Curves']),TotalSegmentCount=segments,TotalPointCount=points,Loop=False)
    d['FadeInTime']=1.2;d['FadeOutTime']=1.2
    return d
# Each preset has three visibly different, moderate full-body poses.
profiles={
 'soft':dict(lean=.42,hand=.20,y=0,z=1.0),
 'reading':dict(lean=.20,hand=.32,y=-2.2,z=.5),
 'focus':dict(lean=.24,hand=.18,y=-1.1,z=.4),
 'rest':dict(lean=.30,hand=.08,y=-1.5,z=1.4,lid=.78),
 'greet':dict(lean=.34,hand=.56,y=.5,z=1.1),
 'display':dict(lean=.55,hand=.38,y=0,z=1.3),
}
for name,p in profiles.items():
 for variant in range(3):
    d=load('motions/idle_desktop.motion3.json');duration=24
    d['Meta']['Duration']=duration
    # Author complete body/arm channels and stagger blink timing across variants.
    d['Curves']=[]
    side=1 if variant!=1 else -1
    period=12+variant*3
    for pid,center,amp,cycle,phase in [
        ('ParamBreath',.34,.13,6,0),('ParamAngleX',side*.6,.8,period,0),
        ('ParamAngleY',p['y'],.35,period,0),('ParamAngleZ',side*p['z']*.5,p['z']*.5,period,0),
        ('ParamBodyAngleX',side*.5,1.0,period,0),('ParamBodyAngleY',0,.55,period,0),
        ('ParamBodyAngleZ',0,.8,period,0),('ParamBodyLean',0,p['lean'],period,0),
        ('ParamEyeBallY',-.15 if name=='reading' else 0,.025,period,0),
        ('ParamWristLX',0,.13,period,0),('ParamWristRX',0,.13,period,3.14),
        ('ParamWristLY',p['hand'] if variant!=1 else .06,.07,period,0),
        ('ParamWristRY',p['hand'] if variant!=0 else .06,.07,period,3.14),
        ('ParamWristLZ',0,.16,6+variant,0),('ParamWristRZ',0,.16,6+variant,3.14),
        ('ParamFoxEarPoseL',0,.23,period,0),('ParamFoxEarPoseR',0,.23,period,1),
    ]: d['Curves'].append(curve(pid,duration,center,amp,cycle,phase))
    for pid in ['ParamEyeLOpen','ParamEyeROpen']:
        lid=p.get('lid',1);seg=[0,lid]
        for t in [3+variant,9+variant,17+variant]:
            seg += [0,t,lid,0,t+.16,.04,0,t+.30,.04,0,t+.5,lid]
        seg += [0,duration,lid]
        d['Curves'].append({'Target':'Parameter','Id':pid,'Segments':seg})
    save(f'motions/web-idle-{name}-{variant}.motion3.json',finish(d))
for src,name in [('nod_smile','nod'),('listen_left','listen-left'),('listen_right','listen-right'),('wink_L','wink-left'),('wink_R','wink-right'),('flick_L','flick-left'),('flick_R','flick-right')]:
    d=load(f'motions/{src}.motion3.json')
    for c in d['Curves']:
        if c['Id'].startswith('ParamAngle'): values(c,lambda v:v*.45)
        elif c['Id'].startswith('ParamFoxEarPose'): values(c,lambda v:v*.28)
        elif c['Id'].startswith('ParamBrow'): values(c,lambda v:v*.65)
        elif c['Id']=='ParamMouthForm': values(c,lambda v:v*.65)
    save(f'motions/web-{name}.motion3.json',finish(d))
d=load('motions/web-idle-soft-0.motion3.json');d['Meta']['Duration']=6
# Use short sampled breathing with one blink instead of stretching the long source motion.
d['Curves']=[curve('ParamBreath',6,.30,.12,6),curve('ParamAngleY',6,0,.3,6)]
for pid in ['ParamEyeLOpen','ParamEyeROpen']:
 d['Curves'].append({'Target':'Parameter','Id':pid,'Segments':[0,1,0,2.8,1,0,2.95,.04,0,3.08,.04,0,3.28,1,0,6,1]})
save('motions/web-breathe.motion3.json',finish(d))
# Brief gestures return all six wrist channels to neutral before resuming an idle.
for name,left,right,lean in [('wave',.60,.08,.22),('stretch',.43,.43,.25),('weight',.15,.15,.58)]:
    d=load('motions/web-breathe.motion3.json');d['Meta']['Duration']=6
    for pid,peak in [('ParamWristLY',left),('ParamWristRY',right),('ParamWristLX',-.16),
                     ('ParamWristRX',.16),('ParamWristLZ',.22),('ParamWristRZ',-.22),
                     ('ParamBodyLean',lean),('ParamBodyAngleZ',1.0)]:
        c=curve(pid,6,0);c['Segments']=[0,0,0,1.8,peak,0,3,peak*.7,0,4.2,peak,0,6,0]
        d['Curves'].append(c)
    save(f'motions/web-{name}.motion3.json',finish(d))
def ref(name,file):return {'Name':name,'File':f'motions/{file}.motion3.json','FadeInTime':1.2,'FadeOutTime':1.2}
config=load('ling.model3.json')
config['FileReferences']['Motions']={
 **{group:[ref(label+' · '+str(i+1),f'web-idle-{name}-{i}') for i in range(3)]
    for name,group,label in [('soft','IdleSoft','轻柔陪伴'),('reading','IdleReading','安静阅读'),
    ('focus','IdleFocus','专注写码'),('rest','IdleRest','放松小憩'),('greet','IdleGreet','轻轻招呼'),('display','IdleDisplay','橱窗展示')]},
 **{group:[ref(label,file)] for group,label,file in [
 ('TapHead','轻轻点头','web-nod'),('TapEarLeft','向左侧耳','web-listen-left'),('TapEarRight','向右侧耳','web-listen-right'),
 ('TapEyeRight','左眼单眨','web-wink-left'),('TapEyeLeft','右眼单眨','web-wink-right'),
 ('FlickLeft','左耳轻动','web-flick-left'),('FlickRight','右耳轻动','web-flick-right'),('Breathe','舒缓呼吸','web-breathe'),('Wave','抬手招呼','web-wave'),('Stretch','双臂舒展','web-stretch'),('WeightShift','左右换重心','web-weight')]}
}
save('ling.model3.json',config)
originals=['Ling.moc3','Ling.physics3.json','Ling.cdi3.json','textures/00.png','textures/01.png']
originals += [str(p.relative_to(root)) for folder in ['expressions','motions'] for p in (root/folder).glob('*.json') if not p.name.startswith('web-')]
save('SOURCE.json',{'version':16,'source':'Ling_Live2DViewerEX_v16/Ling_EX_v16/Ling_Desktop.model3.json','originalSHA256':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in originals},'webAdaptation':'18 varied body-and-arm idle clips and 11 bounded actions; original model, textures, expressions and physics retained.'})
print('v16: 18 varied idle clips, 11 moderate actions, original resource hashes recorded.')
