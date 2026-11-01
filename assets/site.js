(function(){
  var SEG=window.GF_SEGMENTS||[];
  // scripture sheet
  var S=window.GF_SCRIPTURES||{};
  var sheet=document.getElementById('sheet'),back=document.getElementById('sheetBack');
  function openSheet(k){var d=S[k];if(!d||!sheet)return;
    document.getElementById('sheetTitle').textContent=d.t;
    document.getElementById('sheetBody').innerHTML='<p class="v">'+d.v+'</p>'+(d.c?'<p class="cm">'+d.c+'</p>':'');
    document.getElementById('sheetLink').href=d.u;
    sheet.classList.add('open');back.classList.add('open');document.getElementById('sheetClose').focus();}
  function closeSheet(){if(!sheet)return;sheet.classList.remove('open');back.classList.remove('open')}
  document.querySelectorAll('[data-sheet]').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();openSheet(el.getAttribute('data-sheet'))})});
  if(sheet){document.getElementById('sheetClose').addEventListener('click',closeSheet);back.addEventListener('click',closeSheet);
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});}
  // clock accordion (home page)
  var segs=document.querySelectorAll('.seg');
  segs.forEach(function(b){b.addEventListener('click',function(){
    var open=b.getAttribute('aria-expanded')==='true';
    segs.forEach(function(o){o.setAttribute('aria-expanded','false')});
    b.setAttribute('aria-expanded',open?'false':'true');});});
  // timer
  var total=25*60,left=total,tick=null,startedAt=null,leftAtStart=total;
  var tD=document.getElementById('tDisplay'),tS=document.getElementById('tSeg'),tStart=document.getElementById('tStart'),tReset=document.getElementById('tReset');
  function fmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
  function current(){var el=(total-left)/60;for(var i=0;i<SEG.length;i++){if(el>=SEG[i][0]&&el<SEG[i][0]+SEG[i][1])return i}return -1}
  function paint(){if(!tD)return;tD.textContent=fmt(left);var i=current();
    segs.forEach(function(b,j){b.classList.toggle('now',j===i)});
    document.querySelectorAll('section.lesson-seg').forEach(function(s,j){s.classList.toggle('now',j===i)});
    tS.textContent=left<=0?'Time is up':(i>=0&&(tick||left<total)?SEG[i][2]:'Class timer');
    if(typeof timerHint==='function')timerHint();
    if(left<=0)stop();}
  function run(){left=leftAtStart-(Date.now()-startedAt)/1000;paint()}
  function start(){startedAt=Date.now();leftAtStart=left;tick=setInterval(run,500);tStart.textContent='Pause';paint()}
  function stop(){clearInterval(tick);tick=null;if(tStart)tStart.textContent=left<=0?'Done':'Start'}
  if(tStart){tStart.addEventListener('click',function(){if(tick){stop()}else if(left>0){start()}});
    tReset.addEventListener('click',function(){stop();left=total;tStart.textContent='Start';paint()});paint();}
  // bigger text
  var big=document.getElementById('tBig');
  function setBig(on){document.body.classList.toggle('big',on);if(big){big.setAttribute('aria-pressed',on?'true':'false');big.textContent=on?'Normal text':'Bigger text'}try{localStorage.setItem('gf-big',on?'1':'0')}catch(e){}}
  if(big){big.addEventListener('click',function(){setBig(!document.body.classList.contains('big'))});}
  try{if(localStorage.getItem('gf-big')==='1')setBig(true)}catch(e){}
  // reveal answer
  document.querySelectorAll('.reveal').forEach(function(b){b.addEventListener('click',function(){
    var t=document.getElementById(b.getAttribute('aria-controls')),open=t.classList.toggle('open');
    b.setAttribute('aria-expanded',open?'true':'false');b.textContent=open?'Hide the answer':'Show the answer';});});
  // poll (show-of-hands tally, session-only)
  document.querySelectorAll('.poll').forEach(function(p){
    var opts=Array.prototype.slice.call(p.querySelectorAll('.popt')),res=p.querySelector('.pres'),counts=opts.map(function(){return 0});
    function render(){var total=counts.reduce(function(a,b){return a+b},0);
      res.innerHTML=opts.map(function(o,j){var pct=total?Math.round(counts[j]/total*100):0;
        return '<div class="pbar"><span class="plabel">'+o.textContent+'</span><span class="ptrack"><span class="pfill" style="width:'+pct+'%"></span></span><span class="pnum">'+counts[j]+'</span></div>'}).join('')+
        (total?'<p class="ptotal">'+total+' response'+(total===1?'':'s')+'</p>':'');}
    opts.forEach(function(o,i){o.addEventListener('click',function(){counts[i]++;render()})});
    render();
  });
  // presenter mode: one segment at a time
  var pBtn=document.getElementById('tPresent'),pnav=document.getElementById('pnav'),lsegs=document.querySelectorAll('section.lesson-seg'),cur=0;
  function showSeg(i){cur=Math.max(0,Math.min(lsegs.length-1,i));
    lsegs.forEach(function(s,j){s.classList.toggle('active',j===cur)});
    var nm=document.getElementById('pName'),st=document.getElementById('pStep');
    if(nm)nm.textContent=SEG[cur]?SEG[cur][2]:'';if(st)st.textContent=(cur+1)+' of '+lsegs.length;
    document.getElementById('pPrev').disabled=cur===0;document.getElementById('pNext').disabled=cur===lsegs.length-1;
    window.scrollTo({top:0});try{sessionStorage.setItem('gf-cur-'+location.pathname,cur)}catch(e){}timerHint();}
  function timerHint(){var el=document.getElementById('pTimer');if(!el)return;var t=current();el.textContent=(document.body.classList.contains('present')&&t>=0&&t!==cur&&(tick||left<total))?'Timer is in: '+SEG[t][2]:''}
  function setPresent(on){document.body.classList.toggle('present',on);
    if(pBtn){pBtn.setAttribute('aria-pressed',on?'true':'false');pBtn.textContent=on?'Exit':'Present'}
    try{sessionStorage.setItem('gf-present-'+location.pathname,on?'1':'0')}catch(e){}
    if(on){var saved=null;try{saved=sessionStorage.getItem('gf-cur-'+location.pathname)}catch(e){}var i=saved!==null?+saved:current();showSeg(i>=0?i:0)}}
  if(pBtn&&pnav&&lsegs.length){pBtn.addEventListener('click',function(){setPresent(!document.body.classList.contains('present'))});
    document.getElementById('pPrev').addEventListener('click',function(){showSeg(cur-1)});
    document.getElementById('pNext').addEventListener('click',function(){showSeg(cur+1)});
    document.addEventListener('keydown',function(e){if(!document.body.classList.contains('present'))return;
      var onCtl=/^(BUTTON|INPUT|SUMMARY|A|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||'');
      if(e.key==='ArrowRight'||e.key==='PageDown'||(e.key===' '&&!onCtl)){e.preventDefault();showSeg(cur+1)}
      else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();showSeg(cur-1)}
      else if(e.key==='Escape'){setPresent(false)}});
    try{if(sessionStorage.getItem('gf-present-'+location.pathname)==='1')setPresent(true)}catch(e){}}
  var jump=document.getElementById('jumpLesson');
  if(jump){jump.addEventListener('change',function(){if(jump.value)location.href=jump.value});}
  // quiz: shuffled every visit, one question at a time, recap at the end
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  document.querySelectorAll('.quiz').forEach(function(box){
    var cards=Array.prototype.slice.call(box.querySelectorAll('.qq'));if(!cards.length)return;
    var key='gf-quiz-best-'+(box.dataset.quiz||location.pathname),scoreEl=box.querySelector('.score');
    cards.forEach(function(q){var opts=Array.prototype.slice.call(q.querySelectorAll('.opt'));q._right=opts[+q.dataset.answer];q._opts=opts});
    box.classList.add('stepped');
    var head=el('div','qhead'),count=el('span','qcount'),best=el('span','qbest'),bar=el('div','qbar'),fill=el('span','qfill');
    bar.appendChild(fill);head.appendChild(count);head.appendChild(best);box.insertBefore(bar,box.firstChild);box.insertBefore(head,bar);
    var next=el('button','qnext');next.type='button';box.insertBefore(next,scoreEl);
    var recap=el('div','qrecap');box.appendChild(recap);
    var order,idx,right,missed;
    function getBest(){try{return +localStorage.getItem(key)||0}catch(e){return 0}}
    function setBest(v){try{if(v>getBest())localStorage.setItem(key,String(v))}catch(e){}}
    function showBest(){var b=cards.length>3?getBest():0;best.textContent=b?'Your best: '+b+' of '+cards.length:''}
    function start(){
      order=shuffle(cards.slice());idx=0;right=0;missed=[];
      order.forEach(function(q){box.insertBefore(q,next);delete q.dataset.done;
        var wrap=q.querySelector('.opts'),opts=q.dataset.fixed?q._opts:shuffle(q._opts.slice());
        opts.forEach(function(o){o.disabled=false;o.classList.remove('right','wrong');wrap.appendChild(o)});
        q.querySelector('.fb').textContent='';q.classList.remove('on')});
      recap.innerHTML='';recap.classList.remove('on');scoreEl.textContent='';showBest();show(0,false)}
    function show(i,focus){idx=i;order.forEach(function(q,j){q.classList.toggle('on',j===i)});
      count.textContent='Question '+(i+1)+' of '+order.length;fill.style.width=(i/order.length*100)+'%';
      next.classList.remove('on');head.style.display='';bar.style.display='';
      if(focus){var top=box.getBoundingClientRect().top;if(top<70)window.scrollBy({top:top-80,behavior:'smooth'});
        var first=order[i].querySelector('.opt');if(first)try{first.focus({preventScroll:true})}catch(e){}}}
    function answer(q,o){if(q.dataset.done)return;q.dataset.done='1';var ok=o===q._right,fb=q.querySelector('.fb');
      if(ok){right++;o.classList.add('right');fb.textContent='Right. '+q.dataset.note}
      else{o.classList.add('wrong');q._right.classList.add('right');fb.textContent='Not quite. '+q.dataset.note;missed.push(q)}
      q._opts.forEach(function(x){x.disabled=true});
      fill.style.width=((idx+1)/order.length*100)+'%';
      next.textContent=idx<order.length-1?'Next question ›':'See how you did';next.classList.add('on');
      try{next.focus({preventScroll:true})}catch(e){}}
    function finish(){order.forEach(function(q){q.classList.remove('on')});next.classList.remove('on');head.style.display='none';bar.style.display='none';
      var n=order.length,line=right===n?'Every one. You have it.':right>=n*0.7?'Solid. The ones you missed are below.':right>=n*0.4?'Not bad. Worth a second look at the ones below.':'Worth another pass. Here is what you missed.';
      var wasBest=getBest();setBest(right);
      recap.appendChild(el('p','qfinal',right+' of '+n));recap.appendChild(el('p','qline',line));
      if(n>3&&wasBest&&right>wasBest)recap.appendChild(el('p','qline','That beats your best of '+wasBest+'.'));
      if(missed.length){var ul=el('ul','qmissed');missed.forEach(function(q){var li=el('li');
        li.appendChild(el('p','mq',q.querySelector('.prompt-q').textContent));
        li.appendChild(el('p','ma','Answer: '+q._right.textContent));li.appendChild(el('p','mn',q.dataset.note.replace(/^(True|False)\.\s*/,'')));ul.appendChild(li)});recap.appendChild(ul)}
      var again=el('button','btn qagain',n>3?'Try again in a new order':'Try again');again.type='button';
      again.addEventListener('click',function(){start();show(0,true)});recap.appendChild(again);recap.classList.add('on');
      var top=box.getBoundingClientRect().top;if(top<70)window.scrollBy({top:top-80,behavior:'smooth'})}
    cards.forEach(function(q){q._opts.forEach(function(o){o.addEventListener('click',function(){answer(q,o)})})});
    next.addEventListener('click',function(){if(idx<order.length-1)show(idx+1,true);else finish()});
    start();
  });
})();
