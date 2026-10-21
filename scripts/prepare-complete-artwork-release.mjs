import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd(),target='C:/Users/unesh/.codex/trihex-complete-artwork-20261022';
if(fs.existsSync(target))throw new Error('Release target already exists');fs.mkdirSync(target,{recursive:true});
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(f=>/^(src|public|data|scripts|tests|docs)\//.test(f)||(!f.includes('/')&&/\.(json|ts|mjs|md)$/.test(f))||['.gitignore','.vercelignore'].includes(f));
for(const file of files){const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,execFileSync('git',['show',`HEAD:${file}`],{maxBuffer:40*1024*1024}));}
for(const file of ['src/lib/catalog/premium-artwork.ts','artwork-sources.json','docs/artwork-generation-prompts.json','docs/CURRENT_STATUS_AND_FIX_PLAN_2026-10-22.md','docs/PRODUCT_ARTWORK_RELEASE.md']){fs.mkdirSync(path.dirname(path.join(target,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(target,file));}
fs.cpSync(path.join(root,'public/media/artwork'),path.join(target,'public/media/artwork'),{recursive:true});
fs.mkdirSync(path.join(target,'.vercel'),{recursive:true});fs.copyFileSync('.vercel/project.json',path.join(target,'.vercel/project.json'));
console.log(JSON.stringify({target,baseline:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:files.length}));
