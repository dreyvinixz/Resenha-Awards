import { spawn } from 'node:child_process';
import path from 'node:path';
let apiAlreadyRunning = false;
try {
  const response = await fetch('http://127.0.0.1:4175/api/status', {signal:AbortSignal.timeout(700)});
  apiAlreadyRunning = response.ok && (await response.json()).service === 'resenha-awards';
} catch {}
const children = [];
if (!apiAlreadyRunning) children.push(spawn(process.execPath, ['server.js'], {stdio:'inherit', env:process.env}));
else console.log('API Resenha Awards já está ativa na porta 4175.');
children.push(spawn(process.execPath, [path.join('node_modules','vite','bin','vite.js'), ...process.argv.slice(2)], {stdio:'inherit', env:process.env}));
let stopping = false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)if(!child.killed)child.kill();process.exitCode=code;}
for(const child of children){child.on('error',()=>stop(1));child.on('exit',code=>{if(!stopping)stop(code||1)});}
process.on('SIGINT',()=>stop(0));process.on('SIGTERM',()=>stop(0));
