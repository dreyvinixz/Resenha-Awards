import { createServer } from 'node:http';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { createBallotStore } from './storage.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nominationCategories } from './src/nominationCategories.js';

const root = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(root, '.env.local')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const dist = path.join(root, 'dist');
const dataDir = path.resolve(process.env.RESENHA_DATA_DIR || path.join(root, 'data'));
if (process.env.RENDER && !process.env.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória no Render.');
const store = await createBallotStore({ databaseUrl: process.env.DATABASE_URL, dataDir });
const digest = text => createHash('sha256').update(text).digest();
const accessSeed = process.env.RESENHA_ACCESS_SEED || '';
const generatedCodes = accessSeed ? Array.from({length:20}, (_, i) => createHmac('sha256', accessSeed).update(`resenha-voter-${i+1}`).digest('base64url').slice(0,24)) : [];
const voterHashes = [...(process.env.RESENHA_VOTER_CODES || '').split(',').map(v => v.trim()).filter(Boolean), ...generatedCodes].map(digest);
const adminHash = process.env.RESENHA_ADMIN_TOKEN ? digest(process.env.RESENHA_ADMIN_TOKEN) : null;
const discord = {clientId:process.env.DISCORD_CLIENT_ID, clientSecret:process.env.DISCORD_CLIENT_SECRET, guildId:process.env.DISCORD_GUILD_ID, redirectUri:process.env.DISCORD_REDIRECT_URI};
const sessionKey = discord.clientSecret ? digest(discord.clientSecret) : null;
const sign = value => createHmac('sha256', sessionKey).update(value).digest('base64url');
const cookie = req => Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=').map(decodeURIComponent)));
function session(req) { try { const [payload,mac]=cookie(req).resenha_session.split('.'); if (!timingSafeEqual(Buffer.from(mac),Buffer.from(sign(payload)))) return null; const data=JSON.parse(Buffer.from(payload,'base64url')); return data.exp>Date.now()?data:null; } catch { return null; } }
const setCookie=(res,name,value,age)=>res.appendHeader('Set-Cookie',`${name}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${process.env.RENDER?'; Secure':''}`);
const allowEdits = process.env.RESENHA_ALLOW_EDITS === 'true';
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4175);
const json = (res, code, value) => { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(JSON.stringify(value)); };
const authorize = (value, hashes) => { if (typeof value !== 'string' || !value || value.length > 256) return false; const h = digest(value); return hashes.some(item => timingSafeEqual(h,item)); };
async function readJson(req, limit=16384) {
  let size = 0, chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit) throw new Error('large'); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
const failedAttempts = new Map();
const attemptWindowMs = 15 * 60 * 1000;
function attemptAllowed(ip) { const entry = failedAttempts.get(ip); if (!entry) return true; if (Date.now() - entry.started > attemptWindowMs) { failedAttempts.delete(ip); return true; } return entry.count < 10; }
function recordFailure(ip) { const entry = failedAttempts.get(ip); if (!entry || Date.now() - entry.started > attemptWindowMs) failedAttempts.set(ip, { started: Date.now(), count: 1 }); else entry.count++; }
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm','.mp4':'video/mp4','.woff2':'font/woff2'};
createServer(async (req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname==='/api/auth/discord') {
    if (!discord.clientId||!discord.clientSecret||!discord.guildId||!discord.redirectUri) return json(res,503,{error:'Login Discord não configurado.'});
    const state=randomUUID(), payload=Buffer.from(JSON.stringify({state,exp:Date.now()+600000})).toString('base64url'); setCookie(res,'resenha_oauth',payload+'.'+sign(payload),600);
    const auth=new URL('https://discord.com/oauth2/authorize'); auth.search=new URLSearchParams({client_id:discord.clientId,redirect_uri:discord.redirectUri,response_type:'code',scope:'identify guilds.members.read',state}).toString(); res.writeHead(302,{Location:auth.toString(), 'Cache-Control':'no-store'}); return res.end();
  }
  if (url.pathname==='/api/auth/discord/callback' && req.method==='GET') {
    try { const [payload,mac]=cookie(req).resenha_oauth.split('.'); if (!timingSafeEqual(Buffer.from(mac),Buffer.from(sign(payload)))||JSON.parse(Buffer.from(payload,'base64url')).state!==url.searchParams.get('state')) throw Error(); } catch { setCookie(res,'resenha_oauth','',0); res.writeHead(302,{Location:'/indicacoes/?login=erro'}); return res.end(); }
    try { const tokenResponse=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:discord.clientId,client_secret:discord.clientSecret,grant_type:'authorization_code',code:url.searchParams.get('code')||'',redirect_uri:discord.redirectUri})}); if(!tokenResponse.ok) throw Error(); const token=await tokenResponse.json(); const headers={Authorization:`Bearer ${token.access_token}`}; const [userResponse,memberResponse]=await Promise.all([fetch('https://discord.com/api/v10/users/@me',{headers}),fetch(`https://discord.com/api/v10/users/@me/guilds/${discord.guildId}/member`,{headers})]); if(!userResponse.ok||!memberResponse.ok) throw Error(); const user=await userResponse.json(); const payload=Buffer.from(JSON.stringify({id:user.id,name:user.global_name||user.username,exp:Date.now()+7*86400000})).toString('base64url'); setCookie(res,'resenha_session',payload+'.'+sign(payload),7*86400); setCookie(res,'resenha_oauth','',0); res.writeHead(302,{Location:'/indicacoes/','Cache-Control':'no-store'}); return res.end(); } catch {setCookie(res,'resenha_oauth','',0);res.writeHead(302,{Location:'/indicacoes/?login=nao-membro'});return res.end();}
  }
  if (url.pathname==='/api/auth/me'&&req.method==='GET') {const user=session(req);return user?json(res,200,{user:{id:user.id,name:user.name}}):json(res,401,{error:'Entre com o Discord.'});}
  if (url.pathname==='/api/auth/logout'&&req.method==='POST') {setCookie(res,'resenha_session','',0);return json(res,200,{ok:true});}
  if (url.pathname.startsWith('/api/')) {
    if (req.method === 'GET' && url.pathname === '/api/status') return json(res,200,{service:'resenha-awards',configured:!!(adminHash && discord.clientId && discord.clientSecret && discord.guildId && discord.redirectUri)});
    if (req.headers.origin) { try { if (new URL(req.headers.origin).host !== req.headers.host) return json(res,403,{error:'Origem não permitida.'}); } catch { return json(res,403,{error:'Origem não permitida.'}); } }
    const ip = req.socket.remoteAddress || 'unknown';
    if (req.method==='GET' && url.pathname==='/api/indicacoes/status') {
      const member=session(req); if(!member) return json(res,401,{error:'Entre com o Discord.'});
      try {return json(res,200,{categories:await store.categoryStatus(digest(member.id).toString('hex'))});} catch {return json(res,503,{error:'Não foi possível consultar suas indicações.'});}
    }
    if (req.method==='GET' && url.pathname==='/api/indicacoes/resumo') {
      const member=session(req); if(!member)return json(res,401,{error:'Entre com o Discord.'});
      try {const hash=digest(member.id).toString('hex');const items=[];for(const category of nominationCategories){const raw=await store.getCategory(hash,category.name);if(!raw)continue;const data=JSON.parse(raw);items.push({category:category.name,entries:(data.entries||data.names.map(text=>({text}))).map(entry=>({text:entry.text||'',fileName:entry.file?.name||null}))});}return json(res,200,{name:member.name,categories:items});}catch{return json(res,503,{error:'Não foi possível carregar o resumo.'});}
    }
    if (req.method==='GET' && url.pathname==='/api/indicacoes/categoria') {
      const member=session(req); if(!member)return json(res,401,{error:'Entre com o Discord.'});
      const category=url.searchParams.get('nome');if(!nominationCategories.some(c=>c.name===category))return json(res,400,{error:'Categoria inválida.'});
      try {const saved=await store.getCategory(digest(member.id).toString('hex'),category);if(!saved)return json(res,404,{error:'Nenhuma indicação encontrada.'});const data=JSON.parse(saved);return json(res,200,{entries:data.entries||data.names.map(text=>({text,file:null}))});}catch{return json(res,503,{error:'Não foi possível carregar suas indicações.'});}
    }
    if (req.method==='POST' && url.pathname==='/api/indicacoes') {
      const member=session(req); if(!member) return json(res,401,{error:'Entre com uma conta membro do Discord.'});
      let body; try {body=await readJson(req,85*1024*1024);} catch {return json(res,400,{error:'Dados inválidos ou arquivos muito grandes.'});}
      const spec=nominationCategories.find(c=>c.name===body?.category);
      if(!spec || !Array.isArray(body.entries) || body.entries.length<(spec.min??spec.max) || body.entries.length>spec.max) return json(res,400,{error:'Confira a quantidade de indicações desta categoria.'});
      const entries=[];
      for(const entry of body.entries){
        if(!entry || typeof entry.text!=='string' || entry.text.length>2000 || (entry.file && !['media','gif'].includes(spec.kind))) return json(res,400,{error:'Indicação inválida.'});
        const text=entry.text.trim(); let file=null;
        if(entry.file){
          const f=entry.file;
          if(typeof f.name!=='string'||f.name.length>180||typeof f.type!=='string'||typeof f.data!=='string'||! /^[A-Za-z0-9+/]*={0,2}$/.test(f.data)||f.data.length>13981016) return json(res,400,{error:'Arquivo inválido ou maior que 10 MB.'});
          const bytes=Buffer.from(f.data,'base64'); if(!bytes.length||bytes.length>10*1024*1024) return json(res,400,{error:'Cada arquivo deve ter no máximo 10 MB.'});
          const gif=bytes.subarray(0,6).toString('ascii'); if(spec.kind==='gif' && gif!=='GIF87a' && gif!=='GIF89a') return json(res,400,{error:'Envie um arquivo GIF válido.'});
          file={name:f.name.replace(/[\\/\x00-\x1f]/g,'_'),type:spec.kind==='gif'?'image/gif':'application/octet-stream',data:f.data};
        }
        if(spec.kind==='gif'&&!file){try{const u=new URL(text);if(!['http:','https:'].includes(u.protocol))throw Error();}catch{return json(res,400,{error:'Informe um link HTTP(S) ou anexe um GIF.'});}}
        if(!text&&!file)return json(res,400,{error:'Preencha todas as indicações adicionadas.'});
        entries.push({text,file});
      }
      const plain=entries.filter(e=>e.text).map(e=>e.text.normalize('NFKC').toLocaleLowerCase('pt-BR')); if(new Set(plain).size!==plain.length)return json(res,400,{error:'Não repita indicações na mesma categoria.'});
      const voterHash=digest(member.id).toString('hex');
      try {if((await store.categoryStatus(voterHash)).includes(spec.name)){const updated=await store.updateCategory(voterHash,spec.name,JSON.stringify({category:spec.name,entries,discordName:member.name}),new Date().toISOString());return updated?json(res,200,{ok:true,updated:true}):json(res,409,{error:'Não foi possível atualizar.'});} const id=randomUUID(); const saved=await store.saveCategory({id,voterHash,category:spec.name,selections:JSON.stringify({category:spec.name,entries,discordName:member.name}),updatedAt:new Date().toISOString()}); if(!saved)return json(res,409,{error:'Você já enviou indicações nesta categoria.'});return json(res,200,{ok:true,id});} catch {return json(res,503,{error:'Não foi possível salvar as indicações.'});}
    }
    if (req.method==='POST' && url.pathname==='/api/votacao') return json(res,403,{error:'A votação ainda não está aberta.'});
    if (req.method==='GET' && ['/api/organizacao/votos','/api/organizacao/indicacoes','/api/organizacao/codigos'].includes(url.pathname)) {
      if (!adminHash) return json(res,503,{error:'Área da organização não configurada.'});
      const token=req.headers.authorization?.replace(/^Bearer /i,'');
      if (!attemptAllowed(ip)) return json(res,429,{error:'Muitas tentativas. Aguarde e tente novamente.'});
      if (!authorize(token,[adminHash])) { recordFailure(ip); return json(res,401,{error:'Acesso inválido.'}); }
      if (url.pathname === '/api/organizacao/codigos') return json(res,200,{codes:generatedCodes});
      if (url.pathname === '/api/organizacao/indicacoes') { try { const nominations=(await store.listNominations()).map(row=>({id:row.id,...JSON.parse(row.selections),updatedAt:row.updated_at})); return json(res,200,{nominations}); } catch { return json(res,503,{error:'Não foi possível carregar as indicações.'}); } }
      try { const ballots=(await store.list()).map(row=>({id:row.id,choices:JSON.parse(row.selections),updatedAt:row.updated_at})); return json(res,200,{ballots}); }
      catch { return json(res,503,{error:'Não foi possível carregar as fichas.'}); }
    }
    return json(res,404,{error:'Não encontrado.'});
  }
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);return res.end();}
  let pathname; try { pathname=decodeURIComponent(url.pathname); } catch {res.writeHead(400);return res.end();}
  let file=path.resolve(dist,'.'+pathname);
  if (!file.startsWith(dist+path.sep) && file!==dist) {res.writeHead(403);return res.end();}
  if (existsSync(file) && statSync(file).isDirectory()) file=path.join(file,'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {res.writeHead(404);return res.end('Não encontrado');}
  const size=statSync(file).size, headers={'Content-Type':types[path.extname(file).toLowerCase()] || 'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
  const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  let start=0,end=size-1,status=200;
  if (range) { if (!range[1] && range[2]) start=Math.max(0,size-Number(range[2])); else start=Number(range[1]||0); if (range[1] && range[2]) end=Math.min(Number(range[2]),size-1); if (start>end||start>=size) {res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();} status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`; }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD')return res.end();createReadStream(file,{start,end}).pipe(res);
}).listen(port,host,()=>console.log(`Resenha Awards: http://${host}:${port}`));
