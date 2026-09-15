
const WHATSAPP_NUMBER='5551996456479';
const defaultMsg='Olá! Conheci a franquia Que Mercado pelo site e gostaria de receber mais informações.';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
$$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
$$('.whatsapp-link').forEach(a=>{const m=a.dataset.message||defaultMsg;a.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`;a.target='_blank';});
const toggle=$('.menu-toggle'), mobile=$('.mobile-menu'); if(toggle&&mobile){toggle.onclick=()=>{const open=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',open);mobile.setAttribute('aria-hidden',!open)};$$('a',mobile).forEach(a=>a.onclick=()=>mobile.classList.remove('open'))}
// synchronized on desktop; each stacked card advances independently on mobile
const compare=$('[data-scroll-compare]');if(compare){const left=$$('[data-compare-item]',compare),right=$$('[data-gain-item]',compare),leftCol=$('.compare-col.retail',compare),rightCol=$('.compare-col.qm',compare);const progress=(element,total,trigger,step)=>{const distance=trigger-element.getBoundingClientRect().top;return distance<0?0:Math.min(total,Math.floor(distance/step)+1)};const updateCompare=()=>{const mobile=innerWidth<=980,trigger=innerHeight*(mobile?.72:.74),step=mobile?Math.max(120,innerHeight*.14):Math.max(150,innerHeight*.17),leftCount=progress(mobile?leftCol:compare,left.length,trigger,step),rightCount=progress(mobile?rightCol:compare,right.length,trigger,step);left.forEach((item,i)=>item.classList.toggle('done',i<leftCount));right.forEach((item,i)=>item.classList.toggle('on',i<rightCount))};addEventListener('scroll',updateCompare,{passive:true});addEventListener('resize',updateCompare);updateCompare()}
// technology rotator: only runs while visible and always starts at 01
const tech=$('[data-tech-rotator]');
if(tech){
  const data=[
    ['◎','Reconhecimento facial','Controle de entrada e identificação do usuário conforme a configuração da unidade.',['ACESSO','SEGURANÇA','RASTREABILIDADE']],
    ['↻','Estoque inteligente','Acompanhamento de giro e apoio à reposição para reduzir ruptura.',['GIRO','REPOSIÇÃO','EFICIÊNCIA']],
    ['↗','Dados em tempo real','Vendas, estoque e performance acessíveis remotamente.',['VENDAS','PERFORMANCE','DECISÃO']],
    ['▦','Catálogo estratégico','Mix orientado pelo comportamento de consumo e pela realidade de cada ponto.',['MIX','CONSUMO','GIRO']],
    ['◉','Monitoramento remoto','Câmeras, sensores e controle de acesso ajudam a acompanhar a unidade.',['CÂMERAS','SENSORES','CONTROLE']],
    ['⌁','Gestão à distância','A operação foi desenhada para reduzir a necessidade de presença contínua no ponto.',['REMOTO','24H','AUTONOMIA']]
  ];
  const tabs=$$('.tech-tab',tech),nav=$('.tech-nav',tech),stage=$('.tech-stage',tech),icon=$('.tech-icon',stage),title=$('h3',stage),description=$('p',stage),count=$('.tech-count',stage),tags=$('.tech-tags',stage),bar=$('.tech-progress span',stage);
  let idx=0,timer=null,visible=false,tracking=false,horizontal=false,startX=0,startY=0,deltaX=0,dragTarget=null,suppressClick=false;
  const mobile=()=>matchMedia('(max-width: 640px)').matches;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render=i=>{
    idx=(i+data.length)%data.length;
    tabs.forEach((tab,n)=>tab.classList.toggle('active',n===idx));
    const item=data[idx];
    icon.textContent=item[0];
    title.textContent=item[1];
    description.textContent=item[2];
    count.textContent=`${String(idx+1).padStart(2,'0')} / 06`;
    tags.innerHTML=item[3].map(tag=>`<span>${tag}</span>`).join('');
    bar.classList.remove('running');
    void bar.offsetWidth;
    if(visible&&!reduced())bar.classList.add('running');
  };
  const stop=()=>{
    clearInterval(timer);
    timer=null;
    bar.classList.remove('running');
  };
  const start=()=>{
    stop();
    if(visible&&!reduced()){
      render(idx);
      timer=setInterval(()=>render(idx+1),5000);
    }
  };
  const resetDrag=()=>{
    tracking=false;
    horizontal=false;
    deltaX=0;
    if(dragTarget)dragTarget.classList.remove('is-dragging');
    dragTarget=null;
    stage.style.transition='';
    stage.style.transform='';
    stage.style.opacity='';
  };
  const finishDrag=()=>{
    if(!tracking)return;
    const change=horizontal&&Math.abs(deltaX)>42;
    const direction=deltaX<0?1:-1;
    resetDrag();
    if(change){
      suppressClick=true;
      render(idx+direction);
      if(!reduced())stage.animate([
        {transform:`translate3d(${direction*28}px,0,0)`,opacity:.58},
        {transform:'translate3d(0,0,0)',opacity:1}
      ],{duration:260,easing:'cubic-bezier(.2,.75,.25,1)'});
      setTimeout(()=>{suppressClick=false},280);
    }
    start();
  };
  const beginDrag=e=>{
    if(!mobile()||(e.pointerType==='mouse'&&e.button!==0))return;
    tracking=true;
    horizontal=false;
    deltaX=0;
    startX=e.clientX;
    startY=e.clientY;
    dragTarget=e.currentTarget;
    dragTarget.classList.add('is-dragging');
    dragTarget.setPointerCapture?.(e.pointerId);
    stop();
  };
  const moveDrag=e=>{
    if(!tracking||e.currentTarget!==dragTarget)return;
    const x=e.clientX-startX,y=e.clientY-startY;
    if(!horizontal&&Math.abs(x)>8)horizontal=Math.abs(x)>Math.abs(y)*1.1;
    if(!horizontal)return;
    e.preventDefault();
    deltaX=x;
    const offset=Math.max(-88,Math.min(88,x*.45));
    stage.style.transition='none';
    stage.style.transform=`translate3d(${offset}px,0,0)`;
    stage.style.opacity=String(1-Math.min(Math.abs(offset)/420,.16));
  };
  [nav,stage].forEach(target=>{
    target.addEventListener('pointerdown',beginDrag);
    target.addEventListener('pointermove',moveDrag);
    target.addEventListener('pointerup',finishDrag);
    target.addEventListener('pointercancel',finishDrag);
    target.addEventListener('lostpointercapture',finishDrag);
  });
  tech.addEventListener('click',e=>{
    if(!suppressClick)return;
    e.preventDefault();
    e.stopPropagation();
  },true);
  tabs.forEach((tab,i)=>tab.onclick=()=>{render(i);start()});
  render(0);
  stop();
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){idx=0;render(0);start()}else stop();
  },{threshold:.35}).observe(tech);
}
// mobile about section: reveals the narrative in readable steps
const aboutSection=$('[data-about-progressive]');
if(aboutSection&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const aboutItems=[$('.section-heading',aboutSection),...$$('.section-text p',aboutSection)];
  aboutSection.classList.add('about-motion-ready');
  const aboutObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('is-visible',entry.isIntersecting));
  },{threshold:.18,rootMargin:'0px 0px -16% 0px'});
  aboutItems.forEach(item=>aboutObserver.observe(item));
}
// benefits section: heading, signal line and cards enter in sequence
const benefitsSection=$('[data-benefits-motion]');
if(benefitsSection&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  benefitsSection.classList.add('motion-ready');
  new IntersectionObserver(entries=>{
    benefitsSection.classList.toggle('is-active',entries[0].isIntersecting);
  },{threshold:.2,rootMargin:'0px 0px -8% 0px'}).observe(benefitsSection);
}
// mobile steps auto carousel
const steps=$('[data-steps-track]');if(steps){const cards=[...steps.children],dots=$$('.steps-dots i');let idx=0,timer;const mobile=()=>innerWidth<=640;const dot=()=>{if(!mobile())return;const center=steps.scrollLeft+steps.clientWidth/2;let best=0,dist=1e9;cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-center);if(d<dist){dist=d;best=i}});idx=best;dots.forEach((d,i)=>d.classList.toggle('active',i===idx))};const go=i=>{if(!mobile())return;idx=(i+cards.length)%cards.length;steps.scrollTo({left:cards[idx].offsetLeft,behavior:'smooth'})};const start=()=>{clearInterval(timer);if(mobile()&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>go(idx+1),3800)};steps.addEventListener('scroll',dot,{passive:true});new IntersectionObserver(e=>e[0].isIntersecting?start():clearInterval(timer),{threshold:.3}).observe(steps);addEventListener('resize',()=>{if(!mobile()){clearInterval(timer);steps.scrollLeft=0}else start()});dot()}
// counters
const group=$('[data-counter-group]');if(group){let ran=false;new IntersectionObserver(es=>{if(!es[0].isIntersecting||ran)return;ran=true;$$('[data-counter]',group).forEach((el,j)=>{const target=+el.dataset.counter,start=performance.now()+j*80,dur=900;const tick=n=>{const p=Math.max(0,Math.min(1,(n-start)/dur));el.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})},{threshold:.3}).observe(group)}
// business indicators: progressive reveal with a restrained technological scan
const businessMetrics=$('.business-metrics');if(businessMetrics&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const cards=$$('article',businessMetrics);businessMetrics.classList.add('metrics-ready');cards.forEach((card,i)=>card.style.setProperty('--metric-delay',`${i*110}ms`));new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;cards.forEach(card=>card.classList.add('is-visible'))},{threshold:.22}).observe(businessMetrics)}
// scroll checklist
const journey=$('[data-journey]');if(journey){const items=$$('li',journey),count=$('[data-journey-count]',journey),bar=$('.journey-bar span',journey);const update=()=>{const trigger=innerHeight*.66;let n=0;items.forEach(i=>{const on=i.getBoundingClientRect().top<trigger;i.classList.toggle('checked',on);if(on)n++});count.textContent=n;bar.style.width=`${n/items.length*100}%`};addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update()}
// lead form + localStorage (prototype)
const leadForm=$('#leadForm');if(leadForm){leadForm.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(leadForm),lead=Object.fromEntries(fd.entries());lead.id='L-'+Date.now();lead.createdAt=new Date().toISOString();lead.status='Novo';const leads=JSON.parse(localStorage.getItem('qm_leads')||'[]');leads.unshift(lead);localStorage.setItem('qm_leads',JSON.stringify(leads));const feedback=$('.form-feedback',leadForm);feedback.textContent='Pré-cadastro salvo. Abrindo o WhatsApp para continuar o atendimento…';const msg=`Olá! Meu nome é ${lead.nome}. Fiz o pré-cadastro da franquia Que Mercado. Cidade: ${lead.cidade}. Faixa de investimento: ${lead.investimento}. Prazo: ${lead.prazo}.`;setTimeout(()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank'),350)})}
