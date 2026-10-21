import fs from 'node:fs';import postgres from 'postgres';
const names=[...fs.readFileSync('src/db/schema.ts','utf8').matchAll(/pgTable\(\s*["']([^"']+)/g)].map(m=>m[1]);
const sql=postgres(process.env.DATABASE_URL||process.env.POSTGRES_URL,{max:1,prepare:false});
const rows=await sql`select table_name from information_schema.tables where table_schema='public'`;
const existing=new Set(rows.map(r=>r.table_name));
console.log(JSON.stringify({expectedTables:names.length,missingTables:names.filter(n=>!existing.has(n))},null,2));await sql.end();
