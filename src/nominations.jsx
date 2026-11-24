import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { categories, candidates, portraits } from './ballotData.js';
import '../styles.css';

const logo = '/assets/Logo%20Neon%20RESENHA%20AWARDS.png';
function Arrow({ back = false }) { return <svg className="form-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{back ? <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></> : <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>}</svg>; }
const candidateFor = value => portraits.find(person => person.name.toLocaleLowerCase('pt-BR') === value?.trim().toLocaleLowerCase('pt-BR'));
function loadImage(src) { return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Falha ao carregar imagem'));img.src=src;}); }
function wrapText(ctx, text, maxWidth, maxLines=2) {
  const words=text.split(/\s+/), lines=[]; let line='';
  for (const word of words) { const next=line ? `${line} ${word}` : word; if (ctx.measureText(next).width>maxWidth && line) { lines.push(line); line=word; } else line=next; }
  if(line)lines.push(line);
  if(lines.length>maxLines){lines.length=maxLines;let last=lines[maxLines-1];while(ctx.measureText(`${last}…`).width>maxWidth&&last.length)last=last.slice(0,-1);lines[maxLines-1]=`${last}…`;}
  return lines;
}
async function createVoteCard(choices) {
  await document.fonts.ready;
  const usedPortraits = [...new Set(Object.values(choices).map(candidateFor).filter(Boolean))];
  const loaded=await Promise.all([loadImage(logo),...usedPortraits.map(c=>loadImage(c.image))]);
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');
  const background=ctx.createLinearGradient(0,0,1080,1920);background.addColorStop(0,'#08090c');background.addColorStop(.65,'#08090c');background.addColorStop(1,'#10211d');ctx.fillStyle=background;ctx.fillRect(0,0,1080,1920);
  ctx.drawImage(loaded[0],55,65,330,110);ctx.fillStyle='#fcee09';ctx.font='700 23px "Barlow Condensed", sans-serif';ctx.letterSpacing='3px';ctx.fillText('RESENHA AWARDS 2026  //  MINHA FICHA',70,220);
  ctx.letterSpacing='0px';ctx.fillStyle='#f3f2e9';ctx.font='900 76px "Barlow Condensed", sans-serif';ctx.fillText('MINHAS ESCOLHAS',70,310);ctx.fillStyle='#fcee09';ctx.fillRect(70,335,85,5);
  categories.forEach((category,i)=>{
    const col=Math.floor(i/8), row=i%8, x=70+col*500, y=385+row*160, val=choices[category] || '', person=candidateFor(val);
    ctx.fillStyle='#161b1a';ctx.fillRect(x,y,76,76);
    if(person){const image=loaded[usedPortraits.indexOf(person)+1];const scale=Math.min(76/image.width,76/image.height);ctx.drawImage(image,x+(76-image.width*scale)/2,y+(76-image.height*scale)/2,image.width*scale,image.height*scale);}
    else {ctx.fillStyle=val?'#fcee09':'#6b706b';ctx.font='700 34px "Barlow Condensed", sans-serif';ctx.fillText(val?val.trim().slice(0,1).toUpperCase():'—',x+26,y+49);}
    ctx.fillStyle='#a7aaa3';ctx.font='600 21px "Barlow Condensed", sans-serif';ctx.letterSpacing='1px';ctx.fillText(category.toUpperCase(),x+92,y+20,385);ctx.letterSpacing='0px';
    ctx.fillStyle=val?'#f5f3e8':'#797d77';ctx.font='800 29px "Barlow Condensed", sans-serif';wrapText(ctx,val?val.toUpperCase():'NÃO PREENCHIDO',385).forEach((line,j)=>ctx.fillText(line,x+92,y+51+j*32,385));
  });
  ctx.fillStyle='#fcee09';ctx.fillRect(70,1770,940,2);ctx.fillStyle='#d8d9d2';ctx.font='700 25px "Barlow Condensed", sans-serif';ctx.fillText('RESENHA AWARDS  //  2026',70,1820);ctx.fillStyle='#999f96';ctx.font='600 20px "Barlow Condensed", sans-serif';ctx.fillText('FICHA PESSOAL DE PRÉ-VOTAÇÃO',70,1855);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Falha ao gerar imagem')),'image/png'));
}
function App(){
  const [choices,setChoices]=useState({}),[code,setCode]=useState(''),[stage,setStage]=useState('edit'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[cardUrl,setCardUrl]=useState('');
  useEffect(()=>()=>{if(cardUrl)URL.revokeObjectURL(cardUrl)},[cardUrl]);
  const chosen=choices['Jack do Ano'], selected=candidateFor(chosen), count=Object.values(choices).filter(v=>v.trim()).length;
  function setChoice(category,value){setChoices(prev=>({...prev,[category]:value}));setMessage('');}
  function review(event){event.preventDefault();if(!count){setMessage('Preencha pelo menos uma categoria para continuar.');return;}setStage('review');setMessage('');window.scrollTo({top:0,behavior:'smooth'});}
  async function send(event){event.preventDefault();if(busy)return;setBusy(true);setMessage('Enviando sua ficha...');try{
    const response=await fetch('/api/votacao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code.trim(),choices})});
    const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Não foi possível enviar. Tente novamente.');
    setCode('');setStage('sent');setMessage('Ficha enviada para a organização.');window.scrollTo({top:0,behavior:'smooth'});
    try{const blob=await createVoteCard(choices);setCardUrl(URL.createObjectURL(blob));}catch{setMessage('Ficha enviada, mas não foi possível gerar a imagem. Recarregue as imagens e tente novamente.');}
  }catch(error){setMessage(error.message||'Servidor indisponível. Tente novamente mais tarde.');}finally{setBusy(false);}}
  async function download(){try{let url=cardUrl;if(!url){url=URL.createObjectURL(await createVoteCard(choices));setCardUrl(url);}const link=document.createElement('a');link.href=url;link.download='resenha-awards-minhas-escolhas.png';document.body.append(link);link.click();link.remove();}catch{setMessage('Não foi possível gerar a imagem. Tente novamente.');}}
  return <div className="nomination-page"><header className="form-header"><a href="/#inicio" className="form-brand" aria-label="Resenha Awards, início"><img src={logo} alt="Resenha Awards" /></a><nav aria-label="Navegação"><a className="form-back" href="/#indicados"><Arrow back/> VOLTAR AO SITE</a></nav></header><main className="ballot-layout"><div className="ballot-intro"><span className="form-overline">EDIÇÃO 2026 <span> // </span> PRÉ-VOTAÇÃO</span><h1>SUAS<br/><em>ESCOLHAS.</em></h1><div className="form-intro-rule"/><p>Quinze categorias para registrar os nomes, memes e momentos da resenha.</p><p className="ballot-note">Jack do Ano já tem concorrentes. Nas demais categorias, indique livremente quem ou o que merece entrar na disputa.</p><span className="ballot-count">{count.toString().padStart(2,'0')} / {categories.length} CATEGORIAS PREENCHIDAS</span></div>
  {stage==='edit' && <form className="nomination-form ballot-form" onSubmit={review}><div className="form-top"><span>// SUA FICHA</span><span>RESENHA AWARDS 2026</span></div><h2>FAÇA SUAS ESCOLHAS<span>.</span></h2><p className="form-description">Preencha quantas categorias quiser. Você poderá conferir antes de enviar.</p><fieldset className="candidate-fieldset"><legend>01 / JACK DO ANO</legend><div className="candidate-grid">{candidates.map(person=><label key={person.name} className={'candidate-option'+(chosen===person.name?' is-selected':'')}><input type="radio" name="jack" value={person.name} checked={chosen===person.name} onChange={()=>setChoice('Jack do Ano',person.name)}/><span className="candidate-picture"><img src={person.image} alt="" loading="lazy"/></span><span className="candidate-name">{person.name}<span className="candidate-check" aria-hidden="true">✓</span></span></label>)}</div>{selected&&<p className="choice-caption">SUA ESCOLHA: <strong>{selected.name}</strong></p>}</fieldset><datalist id="known-names">{portraits.map(c=><option key={c.name} value={c.name}/>)}</datalist><div className="ballot-fields">{categories.slice(1).map((category,index)=><div className="ballot-field" key={category}><label htmlFor={`category-${index}`}>{String(index+2).padStart(2,'0')} / {category.toUpperCase()}</label><input id={`category-${index}`} maxLength={120} list="known-names" value={choices[category]||''} onChange={e=>setChoice(category,e.target.value)} placeholder="Nome, meme ou momento"/></div>)}</div><button className="form-submit" type="submit">REVISAR MINHAS ESCOLHAS <Arrow/></button><p className="form-feedback" role="status">{message}</p></form>}
  {stage==='review' && <form className="nomination-form ballot-form" onSubmit={send}><div className="form-top"><span>// REVISÃO</span><span>{count} / {categories.length} PREENCHIDAS</span></div><h2>CONFIRA SUA FICHA<span>.</span></h2><p className="form-description">Campos vazios permanecem sem indicação. Confira antes de enviar: por padrão, cada código permite um único envio.</p><div className="review-list">{categories.map(category=><div className="review-row" key={category}><span>{category}</span><strong>{choices[category]?.trim()||'Não preenchido'}</strong></div>)}</div><label htmlFor="access-code">CÓDIGO INDIVIDUAL DE ACESSO</label><input id="access-code" type="password" autoComplete="off" required maxLength={256} value={code} onChange={e=>setCode(e.target.value)} placeholder="Código fornecido pela organização"/><button className="form-submit" type="submit" disabled={busy}>{busy?'ENVIANDO...':'ENVIAR VOTAÇÃO'} <Arrow/></button><button className="ballot-secondary" type="button" onClick={()=>{setStage('edit');setMessage('')}}>VOLTAR E EDITAR</button><p className="form-feedback" role="status">{message}</p></form>}
  {stage==='sent' && <section className="nomination-form ballot-form" aria-labelledby="card-title"><div className="form-top"><span>// FICHA ENVIADA</span><span>RESENHA AWARDS 2026</span></div><h2 id="card-title">SUAS ESCOLHAS<span>.</span></h2><p className="form-description" role="status">{message}</p>{cardUrl?<img className="vote-card-preview" src={cardUrl} alt="Cartão com suas escolhas nas categorias"/>:<p>Preparando seu cartão...</p>}<button className="form-submit" type="button" onClick={download}>BAIXAR MEU CARTÃO <Arrow/></button></section>}</main><footer className="form-footer"><span>RESENHA AWARDS // 2026</span><span>UMA NOITE. MUITAS HISTÓRIAS.</span></footer></div>;
}
createRoot(document.getElementById('form-root')).render(<App/>);
