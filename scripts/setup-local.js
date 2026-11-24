import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
const file = path.resolve('.env.local');
const codes = Array.from({length:20},()=>randomBytes(18).toString('base64url'));
const admin = randomBytes(24).toString('base64url');
const content = ['# Credenciais locais. Distribua um codigo diferente por pessoa.', '# Nao compartilhe a chave da organizacao.', `RESENHA_VOTER_CODES=${codes.join(',')}`, `RESENHA_ADMIN_TOKEN=${admin}`, 'RESENHA_ALLOW_EDITS=false', ''].join('\n');
try { writeFileSync(file,content,{encoding:'utf8',flag:'wx',mode:0o600}); console.log('Configuração local criada em .env.local, com 20 códigos individuais e uma chave da organização.'); }
catch(error) { if(error.code==='EEXIST'){console.log('.env.local já existe; nenhuma credencial foi alterada.');}else{console.error('Não foi possível criar a configuração local.');process.exitCode=1;} }
