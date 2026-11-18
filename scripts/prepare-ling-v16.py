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
profiles={
 'soft-a':dict(lean=.2,breath=.10,z=.45,y=0,ear=.18),
 'soft-b':dict(lean=.15,breath=.12,z=.65,y=.2,ear=.22),
 'reading':dict(lean=.06,breath=.07,z=.15,y=-1.5,ear=.10,eye=-.10),
 'focus':dict(lean=.04,breath=.06,z=.10,y=-.6,ear=.08),
 'rest':dict(lean=.08,breath=.09,z=.6,y=-.8,ear=.10,lid=.78),
 'greet':dict(lean=.10,breath=.09,z=.45,y=0,ear=.15,hand=.08),
 'display':dict(lean=.08,breath=.07,z=.25,y=0,ear=.10),
}
for name,p in profiles.items():
    d=load('motions/idle_desktop.motion3.json');duration=d['Meta']['Duration']
    for c in d['Curves']:
        if c['Id']=='ParamBodyLean': values(c,lambda v:v*p['lean'])
        if c['Id'].startswith('ParamFoxEarPose'): values(c,lambda v:v*p['ear'])
        if c['Id'] in ['ParamEyeLOpen','ParamEyeROpen']: values(c,lambda v:v*p.get('lid',1))
    for pid,center,amp,period in [
        ('ParamBreath',.30,p['breath'],6),('ParamAngleX',0,.25,36),
        ('ParamAngleY',p['y'],.20,18),('ParamAngleZ',0,p['z'],36),
        ('ParamEyeBallY',p.get('eye',0),.015,18),
        ('ParamWristLX',0,.015,36),('ParamWristLY',p.get('hand',0),.008,18),('ParamWristLZ',0,.035 if p.get('hand') else .012,18),
        ('ParamWristRX',0,.012,36),('ParamWristRY',0,.008,18),('ParamWristRZ',0,.012,18),
    ]: d['Curves'].append(curve(pid,duration,center,amp,period))
    save(f'motions/web-idle-{name}.motion3.json', finish(d))
for src,name in [('nod_smile','nod'),('listen_left','listen-left'),('listen_right','listen-right'),('wink_L','wink-left'),('wink_R','wink-right'),('flick_L','flick-left'),('flick_R','flick-right')]:
    d=load(f'motions/{src}.motion3.json')
    for c in d['Curves']:
        if c['Id'].startswith('ParamAngle'): values(c,lambda v:v*.45)
        elif c['Id'].startswith('ParamFoxEarPose'): values(c,lambda v:v*.28)
        elif c['Id'].startswith('ParamBrow'): values(c,lambda v:v*.65)
        elif c['Id']=='ParamMouthForm': values(c,lambda v:v*.65)
    save(f'motions/web-{name}.motion3.json',finish(d))
d=load('motions/web-idle-soft-a.motion3.json');d['Meta']['Duration']=6
# Use short sampled breathing with one blink instead of stretching the long source motion.
d['Curves']=[curve('ParamBreath',6,.30,.12,6),curve('ParamAngleY',6,0,.3,6)]
for pid in ['ParamEyeLOpen','ParamEyeROpen']:
 d['Curves'].append({'Target':'Parameter','Id':pid,'Segments':[0,1,0,2.8,1,0,2.95,.04,0,3.08,.04,0,3.28,1,0,6,1]})
save('motions/web-breathe.motion3.json',finish(d))
def ref(name,file):return {'Name':name,'File':f'motions/{file}.motion3.json','FadeInTime':1.2,'FadeOutTime':1.2}
config=load('ling.model3.json')
config['FileReferences']['Motions']={
 'IdleSoft':[ref('轻柔呼吸','web-idle-soft-a'),ref('轻微重心移动','web-idle-soft-b')],
 'IdleReading':[ref('安静阅读','web-idle-reading')], 'IdleFocus':[ref('专注陪伴','web-idle-focus')],
 'IdleRest':[ref('放松小憩','web-idle-rest')], 'IdleGreet':[ref('轻轻招呼','web-idle-greet')],
 'IdleDisplay':[ref('橱窗展示','web-idle-display')],
 **{group:[ref(label,file)] for group,label,file in [
 ('TapHead','轻轻点头','web-nod'),('TapEarLeft','向左侧耳','web-listen-left'),('TapEarRight','向右侧耳','web-listen-right'),
 ('TapEyeRight','左眼单眨','web-wink-left'),('TapEyeLeft','右眼单眨','web-wink-right'),
 ('FlickLeft','左耳轻动','web-flick-left'),('FlickRight','右耳轻动','web-flick-right'),('Breathe','舒缓呼吸','web-breathe')]}
}
save('ling.model3.json',config)
originals=['Ling.moc3','Ling.physics3.json','Ling.cdi3.json','textures/00.png','textures/01.png']
originals += [str(p.relative_to(root)) for folder in ['expressions','motions'] for p in (root/folder).glob('*.json') if not p.name.startswith('web-')]
save('SOURCE.json',{'version':16,'source':'Ling_Live2DViewerEX_v16/Ling_EX_v16/Ling_Desktop.model3.json','originalSHA256':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in originals},'webAdaptation':'Low-amplitude motion variants; original model, textures, expressions and physics retained.'})
print('v16: 7 gentle idle variants, 8 gentle actions, original resource hashes recorded.')
