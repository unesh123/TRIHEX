import { config } from 'dotenv'; config({path:'.env.local',quiet:true});
import postgres from 'postgres';
import {premiumArtworkForSlug} from '../src/lib/catalog/premium-artwork';
const sql=postgres(process.env.DATABASE_URL||process.env.POSTGRES_URL!,{max:1,prepare:false});
const rows=await sql`select slug from products where product_status in ('PUBLIC','DRAFT') order by slug`;
console.log(rows.filter(r=>!premiumArtworkForSlug(r.slug)).map(r=>r.slug).join('\n'));await sql.end();
