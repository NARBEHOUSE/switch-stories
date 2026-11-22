'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../js/sound.js'), 'utf8');
function harness(enabled = true) {
  let clock = 0, next = 0, active = null, changed;
  const timers = new Map(), calls = [], NSS = {}, settings = {ttsEnabled:enabled};
  const manager = {
    getSettings:()=>settings, onSettingsChange:fn=>changed=fn,
    speak(text) {
      active?.cancel();
      const item = {text, at:clock, cancelled:false};calls.push(item);
      item.started=Promise.resolve(settings.ttsEnabled);
      item.finished=new Promise(resolve=>item.finish=(reason='end')=>resolve({reason,started:settings.ttsEnabled}));
      item.cancel=()=>{item.cancelled=true;item.finish('cancelled');};
      active=item;if(!settings.ttsEnabled)item.finish('disabled');
      return item;
    },
    cancel(){active?.cancel();}
  };
  vm.runInNewContext(source,{NSS,window:{NSS,NarbeVoiceManager:manager},
    setTimeout:(fn,ms)=>{const id=++next;timers.set(id,{fn,at:clock+ms});return id;},clearTimeout:id=>timers.delete(id)});
  const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
  return {voice:NSS.Voice,calls,flush,setEnabled:value=>{settings.ttsEnabled=value;changed(settings);},
    tick:async ms=>{clock+=ms;for(const [id,t] of [...timers])if(t.at<=clock){timers.delete(id);t.fn();}await flush();}};
}
(async()=>{
  {
    const h=harness(),ticket=h.voice.summary('Little Fox','What will he draw?');let finished=false;
    ticket.finished.then(()=>finished=true);
    await h.tick(5000);assert.equal(h.calls.length,1,'no description before title ends');
    h.calls[0].finish();await h.flush();await h.tick(999);
    assert.equal(h.calls.length,1,'full one-second pause after title');assert.equal(finished,false);
    await h.tick(1);assert.equal(h.calls[1].text,'What will he draw?');assert.equal(h.calls[1].at,6000);
    assert.equal(finished,false,'Wait for Speech includes the description');h.calls[1].finish();await h.flush();
    assert.equal((await ticket.finished).reason,'end');assert.equal(finished,true);
  }
  for(const phase of ['title','gap','description']){
    const h=harness(),old=h.voice.summary('Old title','Old description');
    if(phase!=='title'){h.calls[0].finish();await h.flush();}
    if(phase==='description')await h.tick(1000);
    const previous=h.calls.at(-1);h.voice.summary('New title','New description');
    assert.equal(previous.cancelled,true,phase+' speech cancelled');assert.equal((await old.finished).reason,'cancelled');
    previous.finish();await h.flush();await h.tick(10000);
    assert.equal(h.calls.at(-1).text,'New title','stale completion/gap cannot speak old description');
    h.calls.at(-1).finish();await h.flush();await h.tick(1000);assert.equal(h.calls.at(-1).text,'New description');
  }
  for(const stop of ['cancel','new-menu','disabled']){
    const h=harness(),ticket=h.voice.summary('Title','Description');h.calls[0].finish();await h.flush();
    if(stop==='cancel')ticket.cancel();
    else if(stop==='disabled')h.setEnabled(false);
    else h.voice.speak('Settings');
    await h.tick(5000);assert.equal(h.calls.some(c=>c.text==='Description'),false,stop+' cancels pending description');
    assert.equal((await ticket.finished).reason,'cancelled');
  }
  for(const reason of ['disabled','timeout','error','cancelled']){
    const h=harness(),ticket=h.voice.summary('Title','Description');h.calls[0].finish(reason);await h.flush();await h.tick(10000);
    assert.equal(h.calls.length,1,'no follow-up after '+reason);assert.equal((await ticket.finished).reason,reason);
  }
  {const h=harness(false),ticket=h.voice.summary('Title','Description');await h.flush();await h.tick(5000);assert.equal((await ticket.finished).reason,'disabled');assert.equal(h.calls.length,1);}
  {const h=harness(),ticket=h.voice.summary('Title','');h.calls[0].finish();await h.flush();assert.equal((await ticket.finished).reason,'end');assert.equal(h.calls.length,1);}
  {const h=harness();h.voice.speak('Most Read');assert.equal(h.calls[0].text,'Most red');}
  console.log('PASS: title then one-second pause then description; interruption during title/gap/description; settings, blank labels, disabled/failed speech, stale completions and combined scan completion.');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
