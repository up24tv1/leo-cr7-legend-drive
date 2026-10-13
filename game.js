'use strict';
(()=>{
const $=id=>document.getElementById(id);
// ---------- DATA ----------
const CARS=[
 {id:'leo7',name:'Aurum 7',desc:"Leo's signature gold & black legend",style:'leo',price:0,paint:0xd4a72c,spd:72,acc:16,han:1.0},
 {id:'falx',name:'Falx V12',desc:'Razor-wedge supercar',style:'wedge',price:1500,paint:0x7cff2b,spd:76,acc:17,han:1.0},
 {id:'rosso',name:'Rossa Veloce',desc:'Italian grand exotic',style:'exotic',price:3000,paint:0xc8101e,spd:79,acc:17.5,han:1.1},
 {id:'kreis',name:'Kreis GT-R',desc:'Precision track coupe',style:'track',price:5000,paint:0xe9eef2,spd:80,acc:19,han:1.25},
 {id:'zen',name:'Zenith Hyper',desc:'Carbon hypercar',style:'hyper',price:9000,paint:0x1d4fd8,spd:88,acc:21,han:1.15}];
const PAINTS=[0xd4a72c,0x111111,0xc8101e,0x7cff2b,0x1d4fd8,0xe9eef2,0xff6a00,0x8a2be2,0x00c2b8,0xff3e9a];
const OUTFITS=['#c9a227','#111111','#c8101e','#1d4fd8','#ffffff','#7a2bd8'];
const TRACKS=[
 {name:'Sunset Highway',sky:[0xff7a3d,0x3a1c5c],fog:0xf08a5d,sun:0xffc38a,amb:0x8a5a7a,ground:0x5a4030,line:0xfff1c0,props:'palm',price:0},
 {name:'Miami Neon Streets',sky:[0x2b0a4a,0x05010f],fog:0x3a0f5a,sun:0xff4fd8,amb:0x5040a0,ground:0x14101c,line:0x00f0ff,props:'neon',price:1200},
 {name:'Mountain Road',sky:[0xbfe0ff,0x4f86c6],fog:0xc6d8e6,sun:0xffffff,amb:0x8899aa,ground:0x3d6b35,line:0xffffff,props:'pine',price:2500},
 {name:'Coastal Circuit',sky:[0x8fe3ff,0x1680d0],fog:0xa8e8ff,sun:0xfff6d8,amb:0x99bbcc,ground:0xe8d39a,line:0xff3030,props:'coast',price:4000}];
const RACE_LEN=3000;
// ---------- SAVE ----------
const DEF={credits:500,owned:['leo7'],car:'leo7',paint:{},up:{},tracks:[0],best:{},outfit:0,tilt:false,sound:true};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem('leocr7')||'{}'))}catch(e){S=Object.assign({},DEF)}
const save=()=>{try{localStorage.setItem('leocr7',JSON.stringify(S))}catch(e){}};
const upOf=id=>S.up[id]||(S.up[id]={eng:0,nit:0,han:0});
const paintOf=c=>S.paint[c.id]!=null?S.paint[c.id]:c.paint;
// ---------- RENDERER ----------
const canvas=$('c');
const R=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio||1,2));
R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(62,1,0.5,900);
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?78:62;cam.updateProjectionMatrix()}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));resize();
// sky dome
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color()},bot:{value:new THREE.Color()}},
 vertexShader:'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top;uniform vec3 bot;varying float h;void main(){gl_FragColor=vec4(mix(bot,top,pow(clamp(h,0.,1.),.6)),1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(800,16,10),skyMat);scene.add(sky);
const sunDisc=new THREE.Mesh(new THREE.CircleGeometry(40,24),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));scene.add(sunDisc);
const hemi=new THREE.HemisphereLight(0xffffff,0x444444,1.2);scene.add(hemi);
const dir=new THREE.DirectionalLight(0xffffff,2.2);dir.position.set(-30,50,-40);scene.add(dir);
scene.fog=new THREE.Fog(0,60,420);
// env map for reflections
const pm=new THREE.PMREMGenerator(R);let envRT=null;
function buildEnv(t){const es=new THREE.Scene();const g=new THREE.SphereGeometry(10,16,8);
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{top:{value:new THREE.Color(t.sky[0]).multiplyScalar(1.4)},bot:{value:new THREE.Color(t.ground)}},vertexShader:skyMat.vertexShader,
  fragmentShader:'uniform vec3 top;uniform vec3 bot;varying float h;void main(){vec3 c=h>0.?mix(top,top*1.3,h):bot;c+=vec3(1.)*smoothstep(.97,1.,h)*2.;gl_FragColor=vec4(c,1.);}'});
 es.add(new THREE.Mesh(g,m));const l=new THREE.Mesh(new THREE.BoxGeometry(6,.3,1),new THREE.MeshBasicMaterial({color:0xffffff}));l.position.set(0,8,0);es.add(l);
 if(envRT)envRT.dispose();envRT=pm.fromScene(es,0.02);scene.environment=envRT.texture;}
// ---------- WORLD ----------
const world=new THREE.Group();scene.add(world);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),new THREE.MeshLambertMaterial({color:0x444444}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.05;scene.add(ground);
function roadTex(line){const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');
 x.fillStyle='#2b2b30';x.fillRect(0,0,256,256);for(let i=0;i<600;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;x.fillRect(Math.random()*256,Math.random()*256,2,2)}
 const lc='#'+new THREE.Color(line).getHexString();x.fillStyle=lc;x.fillRect(6,0,6,256);x.fillRect(244,0,6,256);
 x.fillStyle='#ffffff';[64,128,192].forEach(p=>x.fillRect(p-2,0,4,128));
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,40);t.anisotropy=4;t.colorSpace=THREE.SRGBColorSpace;return t}
const ROAD_W=14;
const road=new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W,400),new THREE.MeshStandardMaterial({roughness:.75,metalness:.05}));road.rotation.x=-Math.PI/2;scene.add(road);
const curbs=[-1,1].map(s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.6,.25,400),new THREE.MeshStandardMaterial({color:0xcc2222}));m.position.x=s*(ROAD_W/2+.3);scene.add(m);return m});
const finish=new THREE.Group();(()=>{const c=document.createElement('canvas');c.width=128;c.height=32;const x=c.getContext('2d');
 for(let i=0;i<16;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#000':'#fff';x.fillRect(i*8,j*8,8,8)}const t=new THREE.CanvasTexture(c);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W,3),new THREE.MeshBasicMaterial({map:t}));f.rotation.x=-Math.PI/2;f.position.y=.02;finish.add(f);
 const gm=new THREE.MeshStandardMaterial({color:0xc9a227,metalness:.9,roughness:.25});
 [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.6,8,.6),gm);p.position.set(s*(ROAD_W/2+1),4,0);finish.add(p)});
 const b=new THREE.Mesh(new THREE.BoxGeometry(ROAD_W+3,1.6,.4),new THREE.MeshBasicMaterial({map:t}));b.position.y=8;finish.add(b)})();scene.add(finish);
// props (instanced pool per type, recycled)
const PROP_N=60;let props=null;
function makePropSet(type){const g=new THREE.Group();const items=[];
 const mk=()=>{const o=new THREE.Group();
  if(type==='palm'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(.2,.35,7,6),M.trunk);tr.position.y=3.5;tr.rotation.z=.12;o.add(tr);
   for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(.5,4,4),M.leaf);l.position.set(.4,7,0);l.rotation.set(0,i*1.25,1.6);l.translateY(1.8);o.add(l)}}
  else if(type==='neon'){const h=8+Math.random()*22;const b=new THREE.Mesh(new THREE.BoxGeometry(6,h,6),M.bld);b.position.y=h/2;o.add(b);
   const s=new THREE.Mesh(new THREE.BoxGeometry(6.1,.5,6.1),Math.random()<.5?M.neonA:M.neonB);s.position.y=h*.6;o.add(s);
   const s2=s.clone();s2.position.y=h*.3;o.add(s2);const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,6,5),M.pole);p.position.set(0,3,0);}
  else if(type==='pine'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,2,5),M.trunk);tr.position.y=1;o.add(tr);
   for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(2.2-i*.5,3,6),M.pine);c.position.y=2.5+i*1.6;o.add(c)}
   if(Math.random()<.35){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(2+Math.random()*3,0),M.rock);r.position.set(4,1,0);o.add(r)}}
  else{if(Math.random()<.5){const tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,6,6),M.trunk);tr.position.y=3;o.add(tr);
    for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(.45,3.5,4),M.leaf);l.position.set(0,6,0);l.rotation.set(0,i*1.25,1.6);l.translateY(1.6);o.add(l)}}
   else{const t=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,.3),M.barrier);t.position.y=.5;o.add(t);const t2=t.clone();t2.position.z=2;o.add(t2);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,5,5),M.pole);p.position.y=2.5;o.add(p);const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9),M.flag);fl.position.set(.7,4.4,0);o.add(fl)}}
  return o};
 for(let i=0;i<PROP_N;i++){const o=mk();const side=i%2?1:-1;o.userData.side=side;o.userData.off=(type==='neon'?12:9)+Math.random()*(type==='neon'?6:14);
  o.position.set(side*o.userData.off,0,-i*(400/PROP_N*2)/1);items.push(o);g.add(o)}
 // water plane for coast
 if(type==='coast'){const w=new THREE.Mesh(new THREE.PlaneGeometry(800,1600),new THREE.MeshStandardMaterial({color:0x1a8fd0,metalness:.3,roughness:.15}));w.rotation.x=-Math.PI/2;w.position.set(430,0.02,0);g.add(w);g.userData.water=w}
 if(type==='pine'){g.userData.mtn=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(40+Math.random()*50,60+Math.random()*80,6),M.mtn);m.position.set((i%2?1:-1)*(150+Math.random()*150),20,-i*60);g.add(m);g.userData.mtn.push(m)}}
 if(type==='neon'){g.userData.lights=[];for(let i=0;i<20;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,6),i%2?M.neonA:M.neonB);p.position.set((i%2?1:-1)*(ROAD_W/2+.6),.2,-i*20);g.add(p);g.userData.lights.push(p)}}
 g.userData.items=items;return g}
const M={trunk:new THREE.MeshLambertMaterial({color:0x6b4a2b}),leaf:new THREE.MeshLambertMaterial({color:0x2f8a3a}),pine:new THREE.MeshLambertMaterial({color:0x1f5a2c}),
 rock:new THREE.MeshLambertMaterial({color:0x777777,flatShading:true}),mtn:new THREE.MeshLambertMaterial({color:0x5a6d80,flatShading:true}),
 bld:new THREE.MeshStandardMaterial({color:0x1a1530,roughness:.4,metalness:.6}),neonA:new THREE.MeshBasicMaterial({color:0xff2bd6}),neonB:new THREE.MeshBasicMaterial({color:0x00f0ff}),
 pole:new THREE.MeshStandardMaterial({color:0x888888,metalness:.8,roughness:.3}),barrier:new THREE.MeshLambertMaterial({color:0xffffff}),flag:new THREE.MeshBasicMaterial({color:0xff3030,side:THREE.DoubleSide})};
// ---------- CARS ----------
function numTex(n,bg,fg){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.beginPath();x.arc(64,64,60,0,7);x.fill();
 x.fillStyle=fg;x.font='bold 96px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(n,64,70);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const TEX7=numTex('7','#111','#e8c14a');
function buildCar(def,paint){const g=new THREE.Group();const st=def.style;
 const body=new THREE.MeshPhysicalMaterial({color:paint,metalness:.85,roughness:.22,clearcoat:1,clearcoatRoughness:.05});
 const black=new THREE.MeshPhysicalMaterial({color:0x0a0a0a,metalness:.6,roughness:.3,clearcoat:1});
 const glass=new THREE.MeshPhysicalMaterial({color:0x10141c,metalness:1,roughness:.05});
 const gold=new THREE.MeshStandardMaterial({color:0xe2b33c,metalness:1,roughness:.2});
 const tyre=new THREE.MeshStandardMaterial({color:0x111111,roughness:.9});const rim=st==='leo'?gold:new THREE.MeshStandardMaterial({color:0xbbbbbb,metalness:1,roughness:.25});
 const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);g.add(m);return m};
 const L={leo:4.5,wedge:4.6,exotic:4.5,track:4.3,hyper:4.8}[st],W=2.0;
 // lower body
 add(new THREE.BoxGeometry(W,.5,L),body,0,.55,0);
 // nose wedge
 const nose=add(new THREE.BoxGeometry(W*.96,.35,1.3),body,0,.5,-L/2-.25,st==='wedge'?.22:.12);
 // cabin
 if(st==='exotic'){const c=add(new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2),glass,0,.78,.2);c.scale.set(.8,.55,1.5)}
 else if(st==='wedge'){const c=add(new THREE.CylinderGeometry(.25,.95,.55,4,1),glass,0,1.07,.2,0,Math.PI/4);c.scale.set(1,1,2.1)}
 else{const c=add(new THREE.CylinderGeometry(.55,.9,.55,4,1),glass,0,1.07,st==='hyper'?-.1:.3,0,Math.PI/4);c.scale.set(1.15,1,1.8)}
 // side skirts / intakes
 [-1,1].forEach(s=>add(new THREE.BoxGeometry(.08,.25,L*.5),black,s*(W/2+.02),.45,.2));
 // rear diffuser + lights
 add(new THREE.BoxGeometry(W,.25,.2),black,0,.42,L/2);
 const tl=new THREE.MeshBasicMaterial({color:0xff1a1a});add(new THREE.BoxGeometry(W*.85,.08,.05),tl,0,.72,L/2+.01);
 const hl=new THREE.MeshBasicMaterial({color:0xfff6dd});[-1,1].forEach(s=>add(new THREE.BoxGeometry(.45,.06,.05),hl,s*.6,.62,-L/2-.88));
 // wings / fins
 if(st==='track'||st==='leo'){add(new THREE.BoxGeometry(W*.95,.06,.45),st==='leo'?black:body,0,1.32,L/2-.3);[-1,1].forEach(s=>add(new THREE.BoxGeometry(.06,.5,.3),black,s*.6,1.07,L/2-.3))}
 if(st==='hyper'){add(new THREE.BoxGeometry(.06,.6,1.4),body,0,1.1,1.2);add(new THREE.BoxGeometry(W*.9,.05,.4),black,0,.95,L/2-.1)}
 if(st==='wedge'){[-1,1].forEach(s=>add(new THREE.BoxGeometry(.3,.12,.9),black,s*.75,.85,.9))}
 // Leo livery: black hood stripe + number 7
 if(st==='leo'){add(new THREE.BoxGeometry(.6,.02,L*.98),black,0,.81,0);
  const n=new THREE.MeshBasicMaterial({map:TEX7,transparent:true});[-1,1].forEach(s=>add(new THREE.PlaneGeometry(.7,.7),n,s*(W/2+.03),.6,.1,0,s*Math.PI/2));
  add(new THREE.PlaneGeometry(.55,.55),n,0,.83,-1.2,-Math.PI/2)}
 // wheels
 g.userData.wheels=[];const wg=new THREE.CylinderGeometry(.42,.42,.32,14),rg=new THREE.CylinderGeometry(.27,.27,.34,8);
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const w=new THREE.Group();const t=new THREE.Mesh(wg,tyre);t.rotation.z=Math.PI/2;w.add(t);const r=new THREE.Mesh(rg,rim);r.rotation.z=Math.PI/2;w.add(r);
  w.position.set(sx*(W/2-.08),.42,sz*(L/2-.8));g.add(w);g.userData.wheels.push(w)});
 // fake shadow
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(W*1.25,L*1.15),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.03;g.add(sh);
 g.userData.L=L;return g}
// nitro flames
const flameMat=new THREE.MeshBasicMaterial({color:0x6fdcff,transparent:true,opacity:.85});
function addFlames(car){const f=[];[-1,1].forEach(s=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.16,1.2,6),flameMat);m.rotation.x=Math.PI/2;m.position.set(s*.45,.45,car.userData.L/2+.7);m.visible=false;car.add(m);f.push(m)});car.userData.flames=f}
// traffic
const TRAFFIC_COLORS=[0xeeeeee,0x333333,0x2266aa,0xaa3322,0x777777,0x225533,0xddcc88];
function buildTraffic(i){const g=new THREE.Group();const big=i%4===0;const col=TRAFFIC_COLORS[i%TRAFFIC_COLORS.length];
 const m=new THREE.MeshStandardMaterial({color:col,metalness:.5,roughness:.4});const L=big?7:4.2;
 const b=new THREE.Mesh(new THREE.BoxGeometry(2.1,big?2.6:.8,L),m);b.position.y=big?1.6:.7;g.add(b);
 if(!big){const c=new THREE.Mesh(new THREE.BoxGeometry(1.8,.6,2.2),new THREE.MeshStandardMaterial({color:0x111822,metalness:.8,roughness:.1}));c.position.set(0,1.35,.2);g.add(c)}
 else{const c=new THREE.Mesh(new THREE.BoxGeometry(2.1,1.4,1.6),m);c.position.set(0,1.0,-L/2-.6);g.add(c)}
 const tl=new THREE.Mesh(new THREE.BoxGeometry(1.8,.12,.05),new THREE.MeshBasicMaterial({color:0xff2020}));tl.position.set(0,big?.7:.85,L/2+.01);g.add(tl);
 const wg=new THREE.CylinderGeometry(.4,.4,.3,10),wm=new THREE.MeshStandardMaterial({color:0x111111});
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([x,z])=>{const w=new THREE.Mesh(wg,wm);w.rotation.z=Math.PI/2;w.position.set(x*1,.4,z*(L/2-.9));g.add(w)});
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(2.6,L*1.1),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.4,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.03;g.add(sh);
 g.userData.L=L;return g}
const traffic=[];for(let i=0;i<12;i++){const t=buildTraffic(i);t.visible=false;scene.add(t);traffic.push(t)}
const LANES=[-5.25,-1.75,1.75,5.25];
// ---------- AUDIO ----------
let AC=null,eng=null,engG=null,eng2=null,nzG=null,master=null;
function unlockAudio(){if(AC){if(AC.state!=='running')AC.resume();return}
 try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return}
 master=AC.createGain();master.gain.value=S.sound?.5:0;master.connect(AC.destination);
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;engG=AC.createGain();engG.gain.value=0;lp.connect(engG);engG.connect(master);
 eng=AC.createOscillator();eng.type='sawtooth';eng.frequency.value=60;eng.connect(lp);eng.start();
 eng2=AC.createOscillator();eng2.type='square';eng2.frequency.value=30;const g2=AC.createGain();g2.gain.value=.35;eng2.connect(g2);g2.connect(lp);eng2.start();
 const buf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const nz=AC.createBufferSource();nz.buffer=buf;nz.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=.7;nzG=AC.createGain();nzG.gain.value=0;nz.connect(bp);bp.connect(nzG);nzG.connect(master);nz.start();
 AC.resume();
 AC._noise=buf}
function crashSound(){if(!AC)return;const s=AC.createBufferSource();s.buffer=AC._noise;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=700;const g=AC.createGain();
 g.gain.setValueAtTime(.9,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.6);s.connect(f);f.connect(g);g.connect(master);s.start();s.stop(AC.currentTime+.7);
 const o=AC.createOscillator();o.frequency.setValueAtTime(140,AC.currentTime);o.frequency.exponentialRampToValueAtTime(40,AC.currentTime+.4);const og=AC.createGain();og.gain.setValueAtTime(.6,AC.currentTime);og.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.45);o.connect(og);og.connect(master);o.start();o.stop(AC.currentTime+.5)}
function blip(f=880,d=.08){if(!AC)return;const o=AC.createOscillator();o.type='triangle';o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(.25,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(master);o.start();o.stop(AC.currentTime+d+.02)}
['touchstart','touchend','mousedown','keydown','click'].forEach(e=>addEventListener(e,unlockAudio,{passive:true}));
// ---------- INPUT ----------
const K={left:false,right:false,brake:false,nitro:false};let tiltX=0;
const keymap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'brake',KeyS:'brake',Space:'nitro',ShiftLeft:'nitro',KeyN:'nitro'};
addEventListener('keydown',e=>{if(keymap[e.code]){K[keymap[e.code]]=true;e.preventDefault()}if((e.code==='Escape'||e.code==='KeyP')&&G.state==='race')pauseGame()});
addEventListener('keyup',e=>{if(keymap[e.code]){K[keymap[e.code]]=false;e.preventDefault()}});
function bindBtn(el,k){const on=e=>{e.preventDefault();K[k]=true;el.classList.add('on')},off=e=>{e.preventDefault();K[k]=false;el.classList.remove('on')};
 el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
 el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off)}
bindBtn($('L'),'left');bindBtn($('R'),'right');bindBtn($('B'),'brake');bindBtn($('N'),'nitro');
document.addEventListener('touchmove',e=>{if(!e.target.closest||!e.target.closest('#ui'))e.preventDefault()},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
addEventListener('deviceorientation',e=>{if(!S.tilt)return;const land=Math.abs(window.orientation||0)===90||innerWidth>innerHeight;
 let v=land?(e.beta||0)*((window.orientation===-90)?-1:1):(e.gamma||0);tiltX=Math.max(-1,Math.min(1,v/22))});
async function enableTilt(){try{if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted'){S.tilt=false;save();return false}}}catch(e){S.tilt=false;save();return false}return true}
// ---------- GAME ----------
const G={state:'menu',mode:'quick',track:0,fps:60,frames:0};
let player=null,pv={x:0,z:0,spd:0,nitro:1,steer:0,hit:0,time:0,over:0,credits:0,started:false,cd:0,crashes:0};
let curProps=null;
function applyTrack(i){const t=TRACKS[i];skyMat.uniforms.top.value.set(t.sky[1]);skyMat.uniforms.bot.value.set(t.sky[0]);
 scene.fog.color.set(t.fog);scene.fog.near=i===1?40:70;scene.fog.far=i===1?300:460;R.setClearColor(t.fog);
 hemi.color.set(t.sun);hemi.groundColor.set(t.amb);hemi.intensity=i===1?.9:1.3;dir.color.set(t.sun);dir.intensity=i===1?1.0:2.4;
 sunDisc.material.color.set(i===1?0xff4fd8:t.sun);sunDisc.visible=i!==2||true;
 ground.material.color.set(t.ground);const rt=roadTex(t.line);if(road.material.map)road.material.map.dispose();road.material.map=rt;road.material.color.set(i===1?0x9999bb:0xffffff);road.material.needsUpdate=true;
 curbs.forEach(c=>c.material.color.set(i===1?0xff2bd6:i===3?0xffffff:0xcc2222));
 if(curProps){scene.remove(curProps)}curProps=makePropSet(t.props);scene.add(curProps);buildEnv(t)}
function setPlayerCar(){if(player)scene.remove(player);const def=CARS.find(c=>c.id===S.car)||CARS[0];player=buildCar(def,paintOf(def));addFlames(player);scene.add(player);player.userData.def=def}
function stats(){const d=player.userData.def,u=upOf(d.id);return{max:d.spd*(1+u.eng*.05),acc:d.acc*(1+u.eng*.06),han:d.han*(1+u.han*.08),nitroCap:1+u.nit*.2}}
function startRace(mode,track){G.mode=mode;G.track=track;applyTrack(track);setPlayerCar();
 pv={x:LANES[1],z:0,spd:0,nitro:1,steer:0,hit:0,time:0,over:0,credits:0,started:false,cd:3,crashes:0,passed:new Set()};
 traffic.forEach((t,i)=>{t.visible=true;resetTraffic(t,-60-i*45)});
 curProps.userData.items.forEach((o,i)=>o.position.z=-i*14+40);
 finish.position.z=-RACE_LEN;G.state='race';ui('');$('hud').classList.remove('hide');$('touch').classList.remove('hide');
 if(S.tilt){$('L').classList.add('hide');$('R').classList.add('hide')}else{$('L').classList.remove('hide');$('R').classList.remove('hide')}
 showMsg('3');last=performance.now()}
function resetTraffic(t,z){t.userData.lane=Math.floor(Math.random()*4);t.position.set(LANES[t.userData.lane],0,z);t.userData.spd=18+Math.random()*14;t.userData.id=Math.random()}
let msgT=0;function showMsg(s,d=.9){const m=$('msg');m.textContent=s;m.classList.remove('hide');msgT=d}
function update(dt){
 if(G.state!=='race')return;const st=stats();
 if(pv.cd>0){const before=Math.ceil(pv.cd);pv.cd-=dt;const now=Math.ceil(pv.cd);if(now!==before&&now>0){showMsg(String(now));blip(660)}if(pv.cd<=0){showMsg('GO!',.7);blip(1320,.25)}}
 const racing=pv.cd<=0;
 // speed
 let target=st.max;const nitroOn=racing&&K.nitro&&pv.nitro>0.01;
 if(nitroOn){target*=1.35;pv.nitro=Math.max(0,pv.nitro-dt*.28/st.nitroCap)}else pv.nitro=Math.min(1,pv.nitro+dt*.035);
 if(racing){if(K.brake)pv.spd=Math.max(0,pv.spd-dt*45);else if(pv.spd<target)pv.spd=Math.min(target,pv.spd+dt*st.acc*(nitroOn?2.2:1)*(1-pv.spd/(target*1.15)+.25));else pv.spd=Math.max(target,pv.spd-dt*12)}
 if(pv.hit>0)pv.hit-=dt;
 // steering
 let s=(K.right?1:0)-(K.left?1:0);if(S.tilt&&Math.abs(tiltX)>.05)s=tiltX;
 pv.steer+=(s-pv.steer)*Math.min(1,dt*8);const lat=pv.steer*(9+pv.spd*.12)*st.han;
 pv.x=Math.max(-ROAD_W/2+1.2,Math.min(ROAD_W/2-1.2,pv.x+lat*dt*(racing?1:0)));
 pv.z-=pv.spd*dt;if(racing)pv.time+=dt;
 // traffic
 for(const t of traffic){t.position.z-=t.userData.spd*dt;const dz=t.position.z-pv.z;
  if(dz>25){resetTraffic(t,pv.z-260-Math.random()*120);continue}
  if(dz<-400)t.position.z=pv.z-300;
  // overtakes
  if(dz>3&&!pv.passed.has(t.userData.id)){pv.passed.add(t.userData.id);pv.over++;pv.credits+=10}
  // collision
  const L=(t.userData.L+player.userData.L)/2;if(Math.abs(dz)<L-.2&&Math.abs(t.position.x-pv.x)<2.0&&pv.hit<=0){
   pv.spd*=.35;pv.hit=1.0;pv.crashes++;pv.x+=pv.x<t.position.x?-1.2:1.2;t.position.z-=6;crashSound();showMsg('CRASH!',.6);if(navigator.vibrate)navigator.vibrate(80)}}
 // world follow
 road.position.z=pv.z-150;road.material.map.offset.y=(-pv.z/10)%1;curbs.forEach(c=>c.position.z=pv.z-150);
 ground.position.z=pv.z;sky.position.set(0,0,pv.z);sunDisc.position.set(-120,G.track===1?90:60,pv.z-600);sunDisc.lookAt(cam.position);
 dir.position.set(-30,50,pv.z-40);dir.target.position.set(0,0,pv.z);dir.target.updateMatrixWorld();
 const items=curProps.userData.items;for(const o of items){if(o.position.z>pv.z+30)o.position.z-=items.length*14}
 const ud=curProps.userData;if(ud.water)ud.water.position.z=pv.z;if(ud.mtn)ud.mtn.forEach(m=>{if(m.position.z>pv.z+100)m.position.z-=840});
 if(ud.lights)ud.lights.forEach(m=>{if(m.position.z>pv.z+20)m.position.z-=400});
 // player transform
 player.position.set(pv.x,0,pv.z);player.rotation.y=-pv.steer*.18;player.rotation.z=pv.steer*.04+(pv.hit>0?Math.sin(pv.hit*40)*.04:0);
 player.userData.wheels.forEach(w=>w.children.forEach(c=>c.rotation.x-=pv.spd*dt/.42));
 player.userData.flames.forEach(f=>{f.visible=nitroOn;f.scale.set(1,1+Math.random()*.6,1)});
 // camera
 const kmh=pv.spd*3.6;const back=7.5+pv.spd*.03+(nitroOn?1.2:0);
 cam.position.lerp(new THREE.Vector3(pv.x*.75,3.1+pv.spd*.006,pv.z+back),Math.min(1,dt*6));
 cam.lookAt(pv.x*.9,1.1,pv.z-12);const tf=(innerWidth<innerHeight?78:62)+(nitroOn?10:0)+kmh*.02;cam.fov+=(tf-cam.fov)*Math.min(1,dt*3);cam.updateProjectionMatrix();
 // audio
 if(AC&&eng){const t=AC.currentTime;const r=(pv.spd/st.max);eng.frequency.setTargetAtTime(45+r*170+(nitroOn?40:0),t,.05);eng2.frequency.setTargetAtTime(22+r*85,t,.05);
  engG.gain.setTargetAtTime(.18+r*.22,t,.1);nzG.gain.setTargetAtTime(nitroOn?.25:0,t,.05)}
 // HUD
 const dist=Math.min(RACE_LEN,-pv.z);$('spd').textContent=Math.round(kmh);$('dist').textContent=Math.round(dist)+' / '+RACE_LEN+' m';
 $('prog').style.width=(dist/RACE_LEN*100)+'%';$('nit').style.width=(pv.nitro*100)+'%';$('tm').textContent=pv.time.toFixed(2)+'s';
 $('cr').textContent=(S.credits+pv.credits)+' ¢';
 if(dist>=RACE_LEN)finishRace()}
function finishRace(){G.state='results';$('touch').classList.add('hide');if(AC)engG.gain.setTargetAtTime(0,AC.currentTime,.2),nzG.gain.setTargetAtTime(0,AC.currentTime,.05);
 const t=pv.time;const key=G.mode+'_'+G.track;const prev=S.best['tt_'+G.track];let newBest=false;
 const timeBonus=Math.max(0,Math.round((80-t)*8));const clean=pv.crashes===0?150:0;let reward=200+pv.over*10+timeBonus+clean+G.track*60;
 if(G.mode==='tt'){if(!prev||t<prev){S.best['tt_'+G.track]=t;newBest=true;reward+=100}}
 S.credits+=reward;const unlockedNext=G.track+1<TRACKS.length&&!S.tracks.includes(G.track+1);if(unlockedNext)S.tracks.push(G.track+1);save();blip(990,.3);
 showMsg('FINISH!',1.2);
 setTimeout(()=>{if(G.state!=='results')return;$('hud').classList.add('hide');ui(`<div class="panel"><h1>FINISH</h1><h2>${TRACKS[G.track].name} · ${G.mode==='tt'?'TIME TRIAL':'QUICK RACE'}</h2>
 <div class="grid"><div class="card"><small>TIME</small><b>${t.toFixed(2)}s</b></div><div class="card"><small>OVERTAKES</small><b>${pv.over}</b></div><div class="card"><small>CRASHES</small><b>${pv.crashes}</b></div>
 <div class="card"><small>BEST (TT)</small><b>${S.best['tt_'+G.track]?S.best['tt_'+G.track].toFixed(2)+'s':'—'}</b></div></div>
 ${newBest?'<h2>★ NEW BEST TIME ★</h2>':''}<div class="story">Base 200 · Overtakes ${pv.over*10} · Time bonus ${timeBonus}${clean?' · Clean race 150':''}${G.track?' · Track '+G.track*60:''}${newBest?' · Record 100':''}</div>
 <h1 style="font-size:40px">+${reward} ¢</h1>${unlockedNext?`<h2>🔓 ${TRACKS[G.track+1].name} unlocked!</h2>`:''}
 <div class="row"><button class="g" id="again">RACE AGAIN</button><button class="g" id="toGarage">GARAGE</button><button class="o" id="toMenu">MENU</button></div></div>`);
 $('again').onclick=()=>startRace(G.mode,G.track);$('toGarage').onclick=garage;$('toMenu').onclick=menu},1300)}
function pauseGame(){if(G.state!=='race')return;G.state='paused';ui(`<div class="panel"><h1>PAUSED</h1><div class="row"><button class="g" id="res">RESUME</button><button class="o" id="quit">QUIT RACE</button></div></div>`);
 if(AC)engG.gain.value=0,nzG.gain.value=0;$('res').onclick=()=>{ui('');G.state='race';last=performance.now()};$('quit').onclick=menu}
$('pause').addEventListener('click',pauseGame);$('pause').addEventListener('touchend',e=>{e.preventDefault();pauseGame()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
// ---------- MENUS ----------
function ui(h){$('ui').innerHTML=h;$('ui').scrollTop=0}
function avatarSVG(col){return `<svg id="avatar" viewBox="0 0 130 150"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="1" stop-color="#c9a227"/></linearGradient></defs>
<circle cx="65" cy="70" r="62" fill="#000" stroke="url(#gg)" stroke-width="3"/>
<path d="M22 150 Q25 100 65 98 Q105 100 108 150Z" fill="${col}" stroke="#c9a227" stroke-width="2"/><path d="M65 100 L58 150 M65 100 L72 150" stroke="#c9a227" stroke-width="2"/>
<text x="65" y="135" font-size="22" font-weight="900" text-anchor="middle" fill="${col==='#111111'?'#e8c14a':'#111'}">7</text>
<rect x="55" y="82" width="20" height="18" fill="#8a5a3c"/><ellipse cx="65" cy="60" rx="25" ry="29" fill="#a06a45"/>
<path d="M40 52 Q42 26 66 27 Q90 27 91 52 Q84 38 66 40 Q50 38 40 52Z" fill="#1a1a1a"/><path d="M48 33 L60 22 L58 32 L72 20 L70 31 L86 26 L80 38Z" fill="#1a1a1a"/>
<ellipse cx="55" cy="60" rx="3.5" ry="4" fill="#1a1a1a"/><ellipse cx="75" cy="60" rx="3.5" ry="4" fill="#1a1a1a"/><path d="M48 52 L60 54 M70 54 L82 52" stroke="#1a1a1a" stroke-width="3"/>
<path d="M56 74 Q65 80 74 74" stroke="#3a1f12" stroke-width="2.5" fill="none"/><rect x="40" y="46" width="50" height="4" rx="2" fill="url(#gg)" opacity=".0"/></svg>`}
function menu(){G.state='menu';$('hud').classList.add('hide');$('touch').classList.add('hide');traffic.forEach(t=>t.visible=false);
 if(AC&&engG)engG.gain.value=0,nzG.gain.value=0;
 const tr=TRACKS.map((t,i)=>{const un=S.tracks.includes(i);return `<div class="card ${G.track===i?'sel':''}" data-t="${i}"><b>${t.name}</b><small>${un?(S.best['tt_'+i]?'Best '+S.best['tt_'+i].toFixed(2)+'s':'Unlocked'):'🔒 Finish previous track or '+t.price+' ¢'}</small></div>`}).join('');
 ui(`<div class="panel">${avatarSVG(OUTFITS[S.outfit])}<h1>LEO CR7</h1><h2>LEGEND DRIVE</h2>
 <div class="story">Leo is a 19-year-old racing prodigy with one golden supercar and a dream: to become the greatest supercar driver the world has ever seen. Win races, earn credits, and build the dream garage — one legend drive at a time.</div>
 <div class="row"><small>OUTFIT</small>${OUTFITS.map((c,i)=>`<span class="sw ${S.outfit===i?'sel':''}" data-o="${i}" style="background:${c}"></span>`).join('')}</div>
 <div class="grid" id="tracks">${tr}</div>
 <div class="row"><button class="g" id="quick">QUICK RACE</button><button class="g" id="tt">TIME TRIAL</button></div>
 <div class="row"><button class="o" id="gar">GARAGE · ${S.credits} ¢</button><button class="o" id="tilt">STEERING: ${S.tilt?'TILT':'TOUCH'}</button><button class="o" id="snd">SOUND: ${S.sound?'ON':'OFF'}</button></div>
 <div class="story" style="font-size:12px;opacity:.7">Touch: ◀ ▶ steer · BRAKE · NITRO &nbsp;|&nbsp; Keys: ←/→ or A/D · ↓/S brake · Space nitro · P pause<br>Add to Home Screen from Safari's Share menu to play full-screen & offline.</div></div>`);
 document.querySelectorAll('[data-o]').forEach(e=>e.onclick=()=>{S.outfit=+e.dataset.o;save();menu()});
 document.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>{const i=+e.dataset.t;if(!S.tracks.includes(i)){if(S.credits>=TRACKS[i].price&&confirm('Unlock '+TRACKS[i].name+' for '+TRACKS[i].price+' ¢?')){S.credits-=TRACKS[i].price;S.tracks.push(i);save()}else return menu()}G.track=i;applyTrack(i);menu()});
 $('quick').onclick=()=>startRace('quick',G.track);$('tt').onclick=()=>startRace('tt',G.track);$('gar').onclick=garage;
 $('tilt').onclick=async()=>{S.tilt=!S.tilt;if(S.tilt)await enableTilt();save();menu()};
 $('snd').onclick=()=>{S.sound=!S.sound;save();if(master)master.gain.value=S.sound?.5:0;menu()};
 showcase()}
let showcaseOn=false;
function showcase(){if(!S.tracks.includes(G.track))G.track=0;if(!curProps)applyTrack(G.track);setPlayerCar();pv.z=0;pv.x=0;player.position.set(0,0,0);showcaseOn=true}
function garage(){G.state='garage';$('hud').classList.add('hide');$('touch').classList.add('hide');traffic.forEach(t=>t.visible=false);setPlayerCar();showcaseOn=true;
 const sel=CARS.find(c=>c.id===S.car);const u=upOf(sel.id);const cost=l=>300+l*350;
 const upRow=(k,n)=>`<div class="card"><b>${n} ${'■'.repeat(u[k])}${'□'.repeat(5-u[k])}</b><button class="o" data-up="${k}" ${u[k]>=5||S.credits<cost(u[k])?'disabled':''}>${u[k]>=5?'MAX':'UPGRADE '+cost(u[k])+' ¢'}</button></div>`;
 ui(`<div class="panel" style="padding-top:38vh"><h2>GARAGE · ${S.credits} ¢</h2>
 <div class="grid">${CARS.map(c=>{const own=S.owned.includes(c.id);return `<div class="card ${S.car===c.id?'sel':''}"><b>${c.name}</b><small>${c.desc}<br>Top ${Math.round(c.spd*3.6)} km/h</small><br>
  ${own?(S.car===c.id?'<small>✓ SELECTED</small>':`<button class="o" data-sel="${c.id}">SELECT</button>`):`<button class="g" data-buy="${c.id}" ${S.credits<c.price?'disabled':''}>BUY ${c.price} ¢</button>`}</div>`}).join('')}</div>
 <h2>PAINT · ${sel.name}</h2><div class="row">${PAINTS.map(p=>`<span class="sw ${paintOf(sel)===p?'sel':''}" data-p="${p}" style="background:#${p.toString(16).padStart(6,'0')}"></span>`).join('')}</div>
 <h2>UPGRADES</h2><div class="grid">${upRow('eng','ENGINE')}${upRow('nit','NITRO')}${upRow('han','HANDLING')}</div>
 <div class="row"><button class="g" id="back">BACK TO MENU</button></div></div>`);
 document.querySelectorAll('[data-buy]').forEach(e=>e.onclick=()=>{const c=CARS.find(x=>x.id===e.dataset.buy);if(S.credits>=c.price){S.credits-=c.price;S.owned.push(c.id);S.car=c.id;save();blip(1200,.2)}garage()});
 document.querySelectorAll('[data-sel]').forEach(e=>e.onclick=()=>{S.car=e.dataset.sel;save();garage()});
 document.querySelectorAll('[data-p]').forEach(e=>e.onclick=()=>{S.paint[sel.id]=+e.dataset.p;save();garage()});
 document.querySelectorAll('[data-up]').forEach(e=>e.onclick=()=>{const k=e.dataset.up;if(u[k]<5&&S.credits>=cost(u[k])){S.credits-=cost(u[k]);u[k]++;save();blip(1000)}garage()});
 $('back').onclick=menu}
// ---------- LOOP ----------
let last=performance.now(),fpsT=0,fpsN=0,rot=0;
function loop(now){requestAnimationFrame(loop);let dt=Math.min(.05,(now-last)/1000);last=now;
 fpsN++;fpsT+=dt;if(fpsT>=1){G.fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0}
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').classList.add('hide')}
 if(G.state==='race')update(dt);
 else if(G.state==='menu'||G.state==='garage'){rot+=dt*.4;const p=player.position;const portrait=innerWidth<innerHeight;const r=G.state==='garage'?(portrait?9:7):(portrait?11:9);
  cam.position.set(p.x+Math.sin(rot)*r,G.state==='garage'?2.4:2.2,p.z+Math.cos(rot)*r);cam.lookAt(p.x,G.state==='garage'?(portrait?-1.2:-.6):.6,p.z);
  road.position.z=p.z-150;curbs.forEach(c=>c.position.z=p.z-150);ground.position.z=p.z;sky.position.set(0,0,p.z);sunDisc.position.set(-120,60,p.z-600);sunDisc.lookAt(cam.position)}
 G.frames++;R.render(scene,cam)}
window.__game={G,S,K,get pv(){return pv},startRace,menu,garage};
applyTrack(0);menu();requestAnimationFrame(loop);
})();
