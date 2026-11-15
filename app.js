/* ===== 1. DONNÉES (gardées sur ce téléphone) ===== */
const KEY='secret-santa-v1';
const PAGE=document.body.dataset.page; // 'admin' ou 'participant'
const nid=()=>Math.random().toString(36).slice(2,9);
const seed=()=>({date:'2026-12-24',members:[],excl:[],draw:null,sent:{}});
let D;try{D=JSON.parse(localStorage.getItem(KEY))||seed()}catch(e){D=seed()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}};
const mem=id=>D.members.find(m=>m.id===id);
const markSent=id=>{D.sent=D.sent||{};D.sent[id]=true;save();render()};

/* ===== 2. TIRAGE ===== */
const banned=(a,b)=>a===b||D.excl.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
function computeDraw(){
  const ids=D.members.map(m=>m.id);
  for(let t=0;t<5000;t++){const p=ids.slice();
    for(let i=p.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    if(ids.every((a,i)=>!banned(a,p[i]))){const m={};ids.forEach((a,i)=>m[a]=p[i]);return m}}
  return null;
}

/* ===== 3. LIENS : le résultat est brouillé dans le lien ===== */
const SALT='sapin-guirlande-2026';
const enc=o=>{const b=new TextEncoder().encode(JSON.stringify(o)).map((c,i)=>c^SALT.charCodeAt(i%SALT.length));
  return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const dec=s=>{try{const bin=atob(s.replace(/-/g,'+').replace(/_/g,'/'));
  const b=Uint8Array.from(bin,(c,i)=>c.charCodeAt(0)^SALT.charCodeAt(i%SALT.length));return JSON.parse(new TextDecoder().decode(b))}catch(e){return null}};
const BASE=location.origin+location.pathname.replace(/[^/]*$/,''); // dossier du site, la page participant est index.html
const codeFor=m=>enc({g:m.name,r:mem(D.draw[m.id]).name,d:D.date});
const linkFor=m=>BASE+'#r='+codeFor(m);

/* ===== 4. INTERFACE ===== */
const $app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sv=(w,p,sw=2)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I={
 ok:sv(16,'<path d="M5 12l5 5 9-10"/>',3),
 plus:sv(18,'<path d="M12 5v14M5 12h14"/>',2.2),
 x:sv(16,'<path d="M6 6l12 12M18 6L6 18"/>'),
 copy:sv(18,'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>'),
 share:sv(18,'<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/>'),
 eye:sv(18,'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
 tree:'<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l4 6h-2.5l4 5.5H15l4.5 6h-15L9 13.5H6.5l4-5.5H8z" fill="currentColor"/><rect x="10.8" y="19.5" width="2.4" height="3" rx=".6" fill="#7A5230"/><circle cx="12" cy="2.6" r="1.4" fill="#C9A04A"/></svg>',
 cal:sv(18,'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>')
};
const S={pv:null,open:false,confirm:null,drawing:false,toast:'',tab:D.draw?'result':'names'};
const idx=id=>Math.max(0,D.members.findIndex(m=>m.id===id))%5;
const av=m=>`<span class="av a${idx(m.id)}" aria-hidden="true">${esc(m.name[0].toUpperCase())}</span>`;
const fmtDate=d=>d?new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'}):'';
function toast(t){S.toast=t;render();clearTimeout(toast.t);toast.t=setTimeout(()=>{S.toast='';render()},2600)}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function vAdmin(){
  const drawn=!!D.draw, ms=D.members;
  const tabs=drawn?[['result','Résultat'],['names','Prénoms'],['rules','Restrictions']]:[['names',`Prénoms (${ms.length})`],['rules',`Restrictions (${D.excl.length})`]];
  if(!tabs.some(t=>t[0]===S.tab))S.tab=tabs[0][0];
  const opts=sel=>ms.map(m=>`<option value="${m.id}" ${m.id===sel?'selected':''}>${esc(m.name)}</option>`).join('');
  const lockNote=drawn?`<p class="small muted">Le tirage est fait. Touche « Modifier » en bas pour changer la liste.</p>`:'';
  let body='';
  if(S.tab==='names')body=`<div class="card">
    <div class="list">${ms.map(m=>`<div class="row">${av(m)}<span class="grow ell" style="font-weight:600">${esc(m.name)}</span>${drawn?'':`<button class="x" data-act="rm" data-id="${m.id}" aria-label="Retirer ${esc(m.name)}">${I.x}</button>`}</div>`).join('')||'<div class="row small muted">Ajoute au moins 3 prénoms.</div>'}</div>
    ${drawn?lockNote:`<form class="inline" data-form="add"><input id="newm" type="text" placeholder="Ajouter un prénom" maxlength="20" aria-label="Prénom" autocomplete="off"><button class="btn sm pine" type="submit" aria-label="Ajouter">${I.plus}</button></form>`}</div>`;
  else if(S.tab==='rules')body=`<div class="card"><div><h3>Ne peuvent pas se tirer</h3><p class="small muted">Valable dans les deux sens.</p></div>
    <div class="list">${D.excl.length?D.excl.map(([a,b],i)=>`<div class="row"><span class="grow">${esc(mem(a)?.name)} <span class="muted">et</span> ${esc(mem(b)?.name)}</span>${drawn?'':`<button class="x" data-act="rmx" data-id="${i}" aria-label="Supprimer la restriction">${I.x}</button>`}</div>`).join(''):'<div class="row small muted">Aucune restriction pour l’instant.</div>'}</div>
    ${drawn?lockNote:ms.length<2?'':`<form data-form="addx" style="display:flex;flex-direction:column;gap:6px;padding-top:4px"><select id="xa" aria-label="Première personne">${opts(S.xa||ms[0].id)}</select><span class="small muted" style="text-align:center;font-weight:600">et</span><select id="xb" aria-label="Deuxième personne">${opts(S.xb||ms[1].id)}</select><button class="btn sm pine" type="submit" style="width:100%">${I.plus}Ajouter la restriction</button></form>`}</div>`;
  else body=`<div class="card"><div class="row between"><h3>Qui offre à qui</h3><span class="pill ${ms.every(m=>D.sent?.[m.id])?'':'todo'}">${ms.filter(m=>D.sent?.[m.id]).length}/${ms.length} envoyés</span></div>
    <div class="list">${ms.map(m=>`<div class="row"><button class="check" role="checkbox" aria-checked="${!!D.sent?.[m.id]}" data-act="sent" data-id="${m.id}" aria-label="Lien envoyé à ${esc(m.name)}"><span class="box">${I.ok}</span></button><span class="grow" style="min-width:0"><span class="ell" style="display:block;font-weight:600">${esc(m.name)}</span><span class="small muted ell" style="display:block">offre à ${esc(mem(D.draw[m.id]).name)}</span></span>
      <button class="x" data-act="see" data-id="${m.id}" aria-label="Voir la page de ${esc(m.name)}">${I.eye}</button>
      <button class="x" data-act="copy" data-id="${m.id}" aria-label="Copier le lien de ${esc(m.name)}">${I.copy}</button>
      <button class="btn sm pine" data-act="share" data-id="${m.id}">${I.share}Partager</button></div>`).join('')}</div>
    <p class="small muted">La coche s’active quand tu partages ou copies un lien. Touche-la pour la corriger.</p></div>`;
  const date=`<div class="dateline">${I.cal}<span>Échange le <b>${fmtDate(D.date)||'date à choisir'}</b></span>${drawn?'':`<label class="link">Changer<input id="sd" type="date" value="${D.date||''}" aria-label="Date de l’échange"></label>`}</div>`;
  const few=ms.length<3;
  const foot=!drawn?`<div class="foot"><button class="btn" data-act="draw" ${few?'disabled':''}>${few?'Il faut au moins 3 participants':'Lancer le tirage'}</button></div>`
   :`<div class="foot">${S.confirm==='edit'?`<p class="small muted" style="margin-bottom:10px">Le tirage sera effacé. Après tes changements, relance-le et renvoie les nouveaux liens à tout le monde.</p><div class="inline"><button class="btn ghost" data-act="noconf">Annuler</button><button class="btn" data-act="clear">Effacer le tirage</button></div>`
   :S.confirm==='redo'?`<p class="small muted" style="margin-bottom:10px">Tout le monde aura un nouveau nom et un nouveau lien. Les anciens liens montreront l’ancien résultat.</p><div class="inline"><button class="btn ghost" data-act="noconf">Annuler</button><button class="btn" data-act="draw">Refaire</button></div>`
   :`<div class="inline"><button class="btn ghost" data-act="conf" data-id="edit">Modifier</button><button class="btn ghost" data-act="conf" data-id="redo">Refaire le tirage</button></div>`}</div>`;
  return `<div class="scroll"><div class="top"><div class="brand">${I.tree}Secret Santa</div><span class="tag">Admin</span></div>
    <div class="garland" aria-hidden="true"></div>
    <div style="display:flex;flex-direction:column;gap:8px"><h1>${drawn?'Le tirage est fait !':'Prépare le tirage'}</h1>${date}</div>
    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${S.tab===k}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>
    ${body}</div>${foot}`;
}
function vPart(p){
  const bar=S.pv?`<div class="demo"><span>Aperçu de la page de ${esc(p?.g)}</span><button data-act="back">Retour admin</button></div>`:'';
  if(!p)return bar+`<div class="scroll"><div class="empty card" style="margin-top:40px">${I.tree}<h2>${location.hash?'Ce lien ne marche pas':'Ouvre le lien que tu as reçu'}</h2><p class="small">${location.hash?'Demande un nouveau lien à l’organisatrice.':'Ta page personnelle s’ouvre depuis le message de l’organisatrice.'}</p></div></div>`;
  const flakes=S.open&&!reduced?Array.from({length:14},(_,i)=>`<span class="flake" style="left:${(i*7+5)%95}%;animation-delay:${(i%7)*.12}s" aria-hidden="true">❄</span>`).join(''):'';
  const inner=S.open?`<div class="opened" role="status">${flakes}<span class="label">Tu offres un cadeau à</span><span class="big">${esc(p.r)}</span></div>
     ${p.d?`<div class="card" style="text-align:center;align-items:center;gap:4px">${I.cal}<span class="label">Échange des cadeaux</span><h2 style="text-transform:capitalize">${fmtDate(p.d)}</h2></div>`:''}
     <p class="small muted" style="text-align:center">Chut ! Garde-le pour toi. 🤫</p>`
   :`<button class="reveal" data-act="reveal"><span class="rib v"></span><span class="rib h"></span><span class="tagc"><span class="label">Pour ${esc(p.g)}</span><span class="big">?</span><span class="small">Touche pour ouvrir</span></span></button>
     <p class="small muted" style="text-align:center">Assure-toi que personne ne regarde ton écran.</p>`;
  return bar+`<div class="scroll"><div class="top"><div class="brand">${I.tree}Secret Santa</div></div><div class="garland" aria-hidden="true"></div><h1>Salut ${esc(p.g)} !</h1>${inner}</div>`;
}
function current(){if(S.pv)return dec(S.pv);const m=location.hash.match(/^#r=([\w-]+)/);if(m)return dec(m[1]);return PAGE==='participant'?null:undefined}
function render(){
  const keep=document.activeElement?.id;
  const p=current();
  const view=(p!==undefined?'p':'a')+S.tab;
  const sc=view===S.lastView?(document.querySelector('.scroll')?.scrollTop||0):0;
  $app.innerHTML=(p!==undefined?vPart(p):vAdmin())
   +(S.drawing?`<div class="overlay"><div><span class="label">Tirage en cours</span><div class="n" id="cycle">…</div></div></div>`:'')
   +(S.toast?`<div class="toast" role="status">${esc(S.toast)}</div>`:'');
  S.lastView=view;
  const box=document.querySelector('.scroll');if(box)box.scrollTop=sc;
  if(keep==='newm')document.getElementById('newm')?.focus({preventScroll:true});
}
function animate(names,ms,done){S.drawing=true;render();const el=document.getElementById('cycle');let k=0;
  const iv=setInterval(()=>{if(el)el.textContent=names[k++%names.length]},85);
  setTimeout(()=>{clearInterval(iv);S.drawing=false;done()},ms)}
(function snow(){if(reduced)return;const s=document.getElementById('snow');
  s.innerHTML=Array.from({length:18},(_,i)=>{const sz=3+(i*7)%5;return `<i style="left:${(i*37)%100}%;width:${sz}px;height:${sz}px;animation-duration:${9+(i*13)%9}s;animation-delay:-${(i*17)%12}s;--dx:${(i%2?1:-1)*(10+(i*5)%25)}px"></i>`}).join('')})();

$app.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
  if(a==='tab'){S.tab=id;S.confirm=null}
  else if(a==='rm'){D.members=D.members.filter(m=>m.id!==id);D.excl=D.excl.filter(p=>!p.includes(id));S.xa=S.xb=null;save()}
  else if(a==='rmx'){D.excl.splice(+id,1);save()}
  else if(a==='conf')S.confirm=id;
  else if(a==='noconf')S.confirm=null;
  else if(a==='clear'){D.draw=null;D.sent={};S.confirm=null;S.tab='names';save()}
  else if(a==='sent'){D.sent=D.sent||{};D.sent[id]=!D.sent[id];save()}
  else if(a==='draw'){S.confirm=null;const r=computeDraw();
    if(!r){toast('Tirage impossible avec ces restrictions. Retires-en une.');return}
    const go=()=>{D.draw=r;D.sent={};S.tab='result';save();toast('Tirage fait ! Envoie les liens.')};
    reduced?go():animate(D.members.map(m=>m.name),1400,go);return}
  else if(a==='copy'){const m=mem(id),t=linkFor(m);markSent(id);
    (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast(`Lien de ${m.name} copié`),()=>toast('Copie impossible ici'));return}
  else if(a==='share'){const m=mem(id);markSent(id);const t=`Salut ${m.name} ! Voici ton lien pour le Secret Santa 🎁 Ne le partage avec personne : ${linkFor(m)}`;
    if(navigator.share)navigator.share({text:t}).catch(()=>{});
    else (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Message copié, colle-le dans ta messagerie'),()=>toast('Partage impossible ici'));return}
  else if(a==='see'){S.pv=codeFor(mem(id));S.open=false}
  else if(a==='back'){S.pv=null;S.open=false}
  else if(a==='reveal'){const p=current();const others=D.members.map(m=>m.name).filter(n=>n!==p.g);
    if(reduced||!others.length){S.open=true}else{animate(others,1600,()=>{S.open=true;render()});return}}
  render();
});
$app.addEventListener('submit',e=>{e.preventDefault();const f=e.target.dataset.form,v=i=>document.getElementById(i)?.value.trim();
  if(f==='add'){const n=v('newm');if(!n)return;
    if(D.members.some(m=>m.name.toLowerCase()===n.toLowerCase()))return toast(`${n} est déjà dans la liste`);
    D.members.push({id:nid(),name:n});save();render();return}
  if(f==='addx'){const a=v('xa'),b=v('xb');S.xa=a;S.xb=b;if(a===b)return toast('Choisis deux personnes différentes');
    if(D.excl.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a)))return toast('Cette restriction existe déjà');
    D.excl.push([a,b]);save();render()}
});
$app.addEventListener('change',e=>{if(e.target.id==='sd'){D.date=e.target.value;save();render()}});
addEventListener('hashchange',render);
render();
