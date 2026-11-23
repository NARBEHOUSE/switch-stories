'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
function harness(options={}){
 const settings={readAloud:'on',quickPageTurn:'off',imageDescriptions:'off',storyPrompts:'off',look:'book',...options};
 let now=0,next=0,caption='',screen='story';const timers=new Map(),speech=[];
 const NSS={Settings:{is:(k,v)=>settings[k]===v,cvi:()=>settings.look==='cvi',option:()=>({rate:1})},
  UI:{current:()=>screen,show:s=>screen=s,setWords:t=>caption=t,setHint(){},setPageNo(){},setCredits(){},setSpread(){},fadeWords(){},showEndChoices(){}},
  Scene:{newPage(){},celebrate(){}},Input:{refresh(){},announce(){}},Sound:{stopFile(){},check(){},play(){},action(){},after(){}},
  Descriptions:{get:()=>'',parts:()=>[]},Voice:{speak:(text,opts)=>{const s={text,opts,at:now,cancelled:false};
   s.finished=new Promise(r=>s.finish=r);s.cancel=()=>{s.cancelled=true;s.finish({reason:'cancelled'});};speech.push(s);return s;}}};
 const c=vm.createContext({NSS,window:{NSS,NarbeVoiceManager:{getSettings:()=>({rate:1})}},document:{currentScript:null},console,performance:{now:()=>now},
  setTimeout:(fn,delay)=>{const id=++next;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)});
 for(const file of ['js/config.js','js/library.js','stories/abcd/story.js','js/reader.js','js/story.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),c,{filename:file});
 const book=NSS.Library.get('abcd'),flush=async()=>{await Promise.resolve();await Promise.resolve();};
 const advance=async ms=>{now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();await flush();}};
 const finish=async()=>{speech.at(-1).finish({reason:'end'});await flush();};
 NSS.Story.open(book);NSS.Story.goToPage(24);
 return{NSS,book,speech,settings,advance,finish,flush,get caption(){return caption;},setScreen:s=>screen=s};
}
(async()=>{
 for(const look of ['book','cvi']){
  const h=harness({look});assert.equal(h.speech.at(-1).text,'This is X.');
  assert.equal(h.caption,'This is X. Box ends with X.');assert.equal(h.book.pages[24].textParts,null);
  const count=h.speech.length;await h.finish();assert.equal(h.NSS.Story.stats().state,'reading');
  await h.advance(999);assert.equal(h.speech.length,count,'second phrase waits a full second');
  h.NSS.Story.press();assert.equal(h.NSS.Story.stats().state,'reading','normal mode protects the gap');
  await h.advance(1);assert.equal(h.speech.length,count+1);assert.equal(h.speech.at(-1).text,'Box ends with X.');
  assert.equal(h.speech.at(-1).at,1000);assert.equal(h.caption,h.book.pages[24].text,'whole caption stays visible');
  await h.finish();assert.equal(h.NSS.Story.stats().state,'waiting');
  h.NSS.Story.press();assert.equal(h.NSS.Story.stats().state,'acting');h.NSS.Story.tick(4);
  assert.equal(h.NSS.Story.stats().index,24,'animation still waits for a page-turn press');
 }
 {const h=harness({readAloud:'off'});assert.equal(h.speech.length,0);assert.equal(h.caption,h.book.pages[24].text);
  assert.equal(h.NSS.Story.stats().state,'waiting');h.NSS.Story.press();assert.equal(h.NSS.Story.stats().state,'acting');}
 for(const interrupt of ['quick','pause','jump','leave','silent']){
  const h=harness({quickPageTurn:interrupt==='quick'?'on':'off'});await h.finish();const count=h.speech.length;
  if(interrupt==='quick')h.NSS.Story.press();
  if(interrupt==='pause'||interrupt==='silent'){h.NSS.Story.pause();h.setScreen('settings');}
  if(interrupt==='silent'){h.settings.readAloud='off';h.NSS.Story.settingChanged('readAloud');}
  if(interrupt==='jump')h.NSS.Story.goToPage(25);
  if(interrupt==='leave')h.NSS.Story.close();
  await h.advance(2000);
  assert.equal(h.speech.slice(count).some(s=>s.text==='Box ends with X.'),false,interrupt+' cancels pending phrase');
  if(interrupt==='quick')assert.equal(h.NSS.Story.stats().state,'acting','quick turn still starts the box animation');
  if(interrupt==='pause'){h.setScreen('story');h.NSS.Story.resume();assert.equal(h.speech.at(-1).text,'This is X.','resume restarts caption');}
  if(interrupt==='silent'){h.setScreen('story');h.NSS.Story.resume();assert.equal(h.NSS.Story.stats().state,'waiting');}
 }
 {const h=harness(),old=h.speech.at(-1);h.NSS.Story.goToPage(25);old.finish({reason:'end'});await h.flush();await h.advance(2000);
  assert.equal(h.speech.at(-1).text,'Y is for a yo-yo.','stale completion cannot restart X');}
 {const h=harness();h.NSS.Story.close();let done=0;const n=h.speech.length;
  h.NSS.Reader.read({text:'Ordinary narration.'},()=>done++);assert.equal(h.speech.length,n+1);
  await h.finish();assert.equal(done,1,'ordinary captions finish without an inserted pause');}
 {const h=harness();
  const bad=h.NSS.registerStory({folder:'invalid-sequence',title:'Test',pages:[{text:'Printed words.',action:'none',speechSequence:{parts:['Other','words.'],pauseMs:1000}},{text:'End',action:'none'}]});
  assert.equal(bad.pages[0].speechSequence,undefined,'a speech sequence cannot change the caption text');}
 console.log('PASS: exact 1000 ms X narration gap, complete caption, both looks, silent reading, quick turn, pause/resume, page jumps, close, cancelled/stale speech and unchanged ordinary narration.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
