'use strict';
// Exercise the real Reader and Story with controlled speech completions/timers.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
function harness(options={}){
 const settings={readAloud:'on',storyPrompts:'on',imageDescriptions:'off',quickPageTurn:'off',pauseMode:'hold',look:'book',...options};
 let now=0,id=0,screen='story',hint='',caption='';const timers=new Map(),speech=[],sounds=[];
 const NSS={Settings:{is:(k,v)=>settings[k]===v,cvi:()=>settings.look==='cvi',option:()=>({rate:.92})},
  UI:{current:()=>screen,show:s=>screen=s,setHint:s=>hint=s,setWords:s=>caption=s,setPageNo(){},setCredits(){},setSpread(){},fadeWords(){},showEndChoices(){}},
  Scene:{newPage(){},celebrate(){}},Input:{refresh(){},announce(){}},
  Sound:{stopFile(){},check(){},play(){},action(){},after:p=>{sounds.push(p.afterSound);return .5;}},
  Voice:{speak:(text,options)=>{const s={text,options,cancelled:false};speech.push(s);s.finished=new Promise(r=>s.finish=r);s.cancel=()=>{s.cancelled=true;};return s;}}};
 const context=vm.createContext({NSS,window:{NSS,NarbeVoiceManager:{getSettings:()=>({rate:1,ttsEnabled:false})}},console,performance:{now:()=>now},
  setTimeout:(fn,delay)=>{const next=++id;timers.set(next,{fn,at:now+delay});return next;},clearTimeout:n=>timers.delete(n)});
 for(const f of ['config.js','reader.js','story.js'])vm.runInContext(fs.readFileSync(path.join(base,'js',f),'utf8'),context,{filename:f});
 const book={id:'prompt-test',title:'Test',requireFreshTurn:true,pages:[
  {text:'A story.',action:'none'},
  {text:'Fox waits.',action:'breeze'},
  {textParts:['First part.','Second part.'],action:'breeze'},
  {text:'The End',action:'breeze'}]};
 const flush=async()=>{await Promise.resolve();await Promise.resolve();};
 const advance=async ms=>{const end=now+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();await flush();}now=end;await flush();};
 const finish=async()=>{speech.at(-1).finish({reason:'end'});await flush();await advance(250);};
 NSS.Story.open(book);
 return {NSS,settings,book,speech,sounds,finish,flush,advance,get hint(){return hint;},get caption(){return caption;},setScreen:s=>screen=s};
}
(async()=>{
 for(const quick of ['off','on'])for(const mode of ['hold','scan'])for(const look of ['book','cvi']){
  const h=harness({quickPageTurn:quick,pauseMode:mode,look}),{NSS,speech}=h;
  await h.finish();assert.equal(speech.at(-1).text,'Press to turn the page.','cover announces its next action');
  assert.equal(speech.at(-1).options.force,true,'prompts work with Speak Menus off');
  assert.equal(h.caption,'A story.','prompt does not replace the printed words');
  NSS.Story.goToPage(1);assert.equal(speech.at(-1).text,'Fox waits.');
  await h.finish();assert.equal(speech.at(-1).text,'Press to see what happens.');
  const prompt=speech.at(-1);assert.equal(NSS.Story.stats().state,'waiting');
  NSS.Story.press();assert.equal(prompt.cancelled,true);assert.equal(NSS.Story.stats().state,'acting','press interrupts the prompt and starts the action');
  prompt.finish({reason:'end'});await h.flush();assert.equal(NSS.Story.stats().state,'acting','late prompt callback cannot skip action');
  NSS.Story.press();NSS.Story.tick(100);assert.equal(NSS.Story.stats().index,1,'fresh turn press is still required');
  assert.equal(speech.at(-1).text,'Press to turn the page.');
  const turnPrompt=speech.at(-1);NSS.Story.press();assert.equal(turnPrompt.cancelled,true);NSS.Story.tick(1);
  assert.equal(speech.at(-1).text,'First part.');await h.finish();assert.equal(speech.at(-1).text,'Press to keep reading.');
  NSS.Story.press();assert.equal(speech.at(-1).text,'Second part.');await h.finish();assert.equal(speech.at(-1).text,'Press to see what happens.');
  NSS.Story.goToPage(3);await h.finish();NSS.Story.press();NSS.Story.tick(100);assert.equal(speech.at(-1).text,'Press to finish.');
  NSS.Story.close();
 }
 for(const quick of ['off','on']){
  const h=harness({storyPrompts:'off',quickPageTurn:quick});h.NSS.Story.goToPage(1);await h.finish();
  assert.equal(h.speech.at(-1).text,'Fox waits.');assert.equal(h.hint,'Press to see what happens');
  h.NSS.Story.press();h.NSS.Story.tick(100);assert.equal(h.speech.at(-1).text,'Fox waits.');assert.equal(h.hint,'Press to turn the page');
 }
 {const h=harness({readAloud:'off'});h.NSS.Story.goToPage(1);await h.advance(1000);h.NSS.Story.press();h.NSS.Story.tick(100);await h.advance(1000);assert.deepEqual(h.speech,[],'Read Aloud off keeps the story quiet');}
 {const h=harness();h.NSS.Story.goToPage(1);await h.finish();const old=h.speech.at(-1);h.NSS.Story.pause();h.setScreen('pause');assert.equal(old.cancelled,true);
  h.settings.storyPrompts='off';h.setScreen('story');h.NSS.Story.resume();assert.equal(h.speech.at(-1),old,'resume respects prompts off');
  h.settings.storyPrompts='on';h.NSS.Story.resume();assert.equal(h.speech.at(-1).text,'Press to see what happens.');}
 {const h=harness();h.book.pages[1].afterSound='bark.wav';h.NSS.Story.goToPage(1);await h.finish();h.NSS.Story.press();const n=h.speech.length;h.NSS.Story.tick(100);
  assert.equal(h.speech.length,n);await h.advance(250);assert.deepEqual(h.sounds,['bark.wav']);await h.advance(499);assert.equal(h.speech.length,n,'closing sound finishes before the prompt');
  await h.advance(1);assert.equal(h.speech.at(-1).text,'Press to turn the page.');}
 {const h=harness();h.book.pages[1].afterSound='bark.wav';h.NSS.Story.goToPage(1);await h.finish();h.NSS.Story.press();h.NSS.Story.tick(100);await h.advance(250);
  h.NSS.Story.press();h.NSS.Story.tick(1);const current=h.speech.at(-1);await h.advance(1000);assert.equal(h.speech.at(-1),current,'a delayed old-page prompt cannot interrupt the next page');}
 {const h=harness();h.NSS.Story.goToPage(1);h.speech.at(-1).finish({reason:'end'});await h.flush();h.NSS.Story.pause();h.setScreen('pause');const n=h.speech.length;await h.advance(1000);assert.equal(h.speech.length,n,'pausing cancels a pending ready prompt');}
 {const h=harness();h.book.requireFreshTurn=false;h.NSS.Story.goToPage(1);await h.finish();h.NSS.Story.press();h.NSS.Story.press();const n=h.speech.length;
  h.NSS.Story.tick(100);assert.equal(h.NSS.Story.stats().state,'turning');assert.equal(h.speech.length,n,'a queued normal turn does not announce an obsolete prompt');
  h.NSS.Story.tick(1);assert.equal(h.speech.at(-1).text,'First part.');}
 console.log('PASS: automatic prompts after narration/actions, all next-step labels, both looks/input modes/quick modes, Off/Read Aloud, interruption, pause and closing-sound timing.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
