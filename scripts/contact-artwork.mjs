import fs from 'node:fs';import sharp from 'sharp';import path from 'node:path';
const source='C:/Users/unesh/.codex/generated_images/01a15ec7-3b6e-7a13-a54d-eda0ef196cd6';
const files=fs.readdirSync(source).filter(f=>f.endsWith('.png')).sort((a,b)=>fs.statSync(path.join(source,a)).mtimeMs-fs.statSync(path.join(source,b)).mtimeMs);
const tiles=await Promise.all(files.map(async(f,i)=>({input:await sharp(path.join(source,f)).resize(180,180).png().toBuffer(),left:(i%6)*180,top:Math.floor(i/6)*180})));
await sharp({create:{width:1080,height:Math.ceil(files.length/6)*180,channels:3,background:'#eee'}}).composite(tiles).png().toFile('artifacts/artwork-check/generated-contact-sheet.png');console.log(files.length);
