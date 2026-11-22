'use strict';
// Real Reader cancellation and continuous passages across every shipped book.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
function harness(options = {}, continuous = true, suppliedStory = null) {
  const settings = {readAloud:'on',storyPrompts:'on',imageDescriptions:'off',quickPageTurn:'off',look:'book',pauseMode:'hold',...options};
  let now=0, next=0, screen='story', caption='', hint='';
  const timers=new Map(), speech=[];
  const NSS={Settings:{is:(k,v)=>settings[k]===v,cvi:()=>settings.look==='cvi',option:()=>({rate:1})},
    UI:{current:()=>screen,show:s=>screen=s,setHint:s=>hint=s,setWords:s=>caption=s,setPageNo(){},setCredits(){},setSpread(){},fadeWords(){},showEndChoices(){}},
    Scene:{newPage(){},celebrate(){}}, Input:{refresh(){},announce(){}},
    Sound:{stopFile(){},check(){},play(){},action(){},after(){}},
    Descriptions:{get:()=> 'A picture of two heroes.',parts:t=>t?[t]:[]},
    Voice:{speak:(text,opts)=>{const item={text,opts,cancelled:false};item.finished=new Promise(r=>item.finish=r);item.cancel=()=>{item.cancelled=true;};speech.push(item);return item;}}};
  const context=vm.createContext({NSS,window:{NSS,NarbeVoiceManager:{getSettings:()=>({rate:1})}},console,performance:{now:()=>now},
    setTimeout:(fn,delay)=>{const id=++next;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)});
  for(const file of ['config.js','reader.js','story.js'])vm.runInContext(fs.readFileSync(path.join(base,'js',file),'utf8'),context,{filename:file});
  const story=suppliedStory||{id:'continuous-test',title:'Heroes',autoReadParts:continuous,pages:[{text:'Heroes',action:'none'},
    {text:'First. Second. Third.',textParts:['First.','Second.','Third.'],action:'none'}, {text:'The End',action:'none'}]};
  const flush=async()=>{await Promise.resolve();await Promise.resolve();};
  const finish=async()=>{speech.at(-1).finish({reason:'end'});await flush();};
  const advance=async ms=>{now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();await flush();}};
  NSS.Story.open(story);NSS.Story.goToPage(1);
  return {NSS,settings,story,speech,finish,flush,advance,setScreen:s=>screen=s,get caption(){return caption;},get hint(){return hint;}};
}
(async()=>{
  let checks=0;
  for(const readAloud of ['on','off'])for(const quickPageTurn of ['on','off'])for(const look of ['book','cvi'])for(const pauseMode of ['hold','scan']){
    const h=harness({readAloud,quickPageTurn,look,pauseMode}), {NSS}=h;
    for(let i=0;i<3;i++){
      assert.equal(h.caption,h.story.pages[1].textParts[i]);
      assert.equal(NSS.Story.view().index,1,'passages keep the physical page');
      assert.equal(NSS.Story.view().partIndex,i);
      if(readAloud==='on'){
        assert.equal(h.speech.at(-1).text,h.caption);
        await h.finish();
        if(i<2)assert.equal(NSS.Story.stats().state,'reading','next passage is spoken without a press');
      }else{
        assert.equal(NSS.Story.stats().state,'done','silent passage is ready immediately');
        await h.advance(60000);NSS.Story.tick(60);
        assert.equal(NSS.Story.view().partIndex,i,'silent passage waits indefinitely');
        assert.equal(h.speech.length,0,'no silent speech');
        if(i<2){assert.equal(h.hint,'Press to keep reading');NSS.Story.press();}
      }
    }
    assert.equal(NSS.Story.stats().state,'done');
    assert.equal(h.hint,'Press to turn the page');
    NSS.Story.tick(60);assert.equal(NSS.Story.view().index,1,'no automatic physical turn');
    assert.equal(NSS.Story.stats().actions,0,'no action step');
    NSS.Story.press();NSS.Story.tick(1);assert.equal(NSS.Story.view().index,2);
    if(readAloud==='on')await h.finish();
    assert.equal(h.hint,'Press to finish');NSS.Story.press();NSS.Story.tick(1);
    assert.equal(NSS.Story.stats().state,'end');NSS.Story.readAgain();assert.equal(NSS.Story.view().index,0);
    checks++;
  }
  {const h=harness({quickPageTurn:'on'});const first=h.speech.at(-1);h.NSS.Story.press();
    assert.equal(first.cancelled,true);assert.equal(h.caption,'Second.');assert.equal(h.speech.at(-1).text,'Second.');
    first.finish({reason:'end'});await h.flush();assert.equal(h.caption,'Second.','stale completion cannot skip a group');
    h.NSS.Story.press();assert.equal(h.speech.at(-1).text,'Third.');h.NSS.Story.press();h.NSS.Story.tick(1);assert.equal(h.caption,'The End');}
  {const h=harness();const first=h.speech.at(-1);h.NSS.Story.pause();h.setScreen('settings');first.finish({reason:'end'});await h.flush();
    assert.equal(h.caption,'First.','pause cancels continuous narration');h.setScreen('story');h.NSS.Story.resume();assert.equal(h.speech.at(-1).text,'First.');
    await h.finish();assert.equal(h.caption,'Second.');h.NSS.Story.pause();h.setScreen('settings');h.settings.readAloud='off';h.NSS.Story.settingChanged('readAloud');
    h.setScreen('story');h.NSS.Story.resume();assert.equal(h.caption,'Second.');assert.equal(h.NSS.Story.stats().state,'done');
    h.NSS.Story.pause();h.setScreen('settings');h.settings.readAloud='on';const n=h.speech.length;h.NSS.Story.settingChanged('readAloud');
    assert.equal(h.speech.length,n,'no speech over Settings');h.setScreen('story');h.NSS.Story.resume();assert.equal(h.speech.at(-1).text,'Second.');}
  {const h=harness({readAloud:'off'});h.NSS.Story.press();h.NSS.Story.press();assert.equal(h.caption,'Third.');
    h.NSS.Story.pause();h.setScreen('settings');h.settings.readAloud='on';h.NSS.Story.settingChanged('readAloud');h.setScreen('story');h.NSS.Story.resume();
    assert.equal(h.speech.at(-1).text,'Third.','enabling narration reads the last silent group too');}
  {const h=harness({imageDescriptions:'on'});await h.finish();assert.equal(h.NSS.Story.stats().state,'descriptionReady');
    h.NSS.Story.press();assert.equal(h.caption,'First.');await h.finish();assert.equal(h.caption,'Second.');await h.finish();await h.finish();
    assert.equal(h.NSS.Story.stats().state,'done','static book has no after-action description');}
  // Load every shipped book through the real normalizer, including older books.
  const books={};const c=vm.createContext({NSS:books,window:{NSS:books},document:{currentScript:null},console});
  for(const file of ['js/config.js','js/library.js','stories/list.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),c);
  for(const id of books.STORY_LIST){c.document.currentScript={src:'file:///stories/'+id+'/story.js'};vm.runInContext(fs.readFileSync(path.join(base,'stories',id,'story.js'),'utf8'),c);}
  await books.Library.load();
  assert.equal(books.Library.all().length,books.STORY_LIST.length,'all shipped stories are covered');
  let bookChecks=0;
  for(const book of books.Library.all()){
    assert.equal(book.autoReadParts,true,book.id+' continues spoken passages');
    const indices=book.pages.map((p,i)=>p.textParts?.length>1?i:-1).filter(i=>i>=0);
    if(!indices.length)indices.push(1);
    for(const readAloud of ['on','off'])for(const quickPageTurn of ['on','off'])for(const look of ['book','cvi'])for(const index of indices){
      const h=harness({readAloud,quickPageTurn,look,storyPrompts:'off'},true,book);h.NSS.Story.goToPage(index);
      const page=book.pages[index],parts=page.textParts||[page.text];
      for(let i=0;i<parts.length;i++){
        assert.equal(h.caption,parts[i],book.id+' passage '+i);assert.equal(h.NSS.Story.stats().index,index);
        if(readAloud==='on'){
          // Undo the existing speech-only pronunciation hints before comparing.
          assert.equal(h.speech.at(-1).text.replace(/ree-sess/gi,'recess').replace(/tiers/gi,'tears'),parts[i]);await h.finish();
        }else if(i<parts.length-1){
          assert.equal(h.NSS.Story.stats().state,'done');await h.advance(60000);
          assert.equal(h.NSS.Story.stats().partIndex,i,'silent passage waits');h.NSS.Story.press();
        }
      }
      assert.equal(h.NSS.Story.stats().actions,0,'narration never triggers the animation');
      assert.equal(h.NSS.Story.stats().state,page.action==='none'?'done':'waiting');
      h.NSS.Story.tick(60);assert.equal(h.NSS.Story.stats().index,index,'no automatic page turn');
      if(page.action!=='none'){
        h.NSS.Story.press();assert.equal(h.NSS.Story.stats().state,'acting');
        h.NSS.Story.tick(.01);assert.equal(h.NSS.Story.stats().state,'acting','full animation remains available');
      }
      bookChecks++;
    }
  }
  console.log(`PASS: ${checks} continuous/silent combinations and ${bookChecks} real-book passage flows; all ${books.STORY_LIST.length} books, both looks, quick turns, cancellation, pause/resume, descriptions, manual actions and page turns.`);
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
