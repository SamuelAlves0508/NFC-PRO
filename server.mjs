import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { searchPlaces } from './integration/places.mjs';

const root=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const host=option('--host',process.env.HOST||'127.0.0.1'),port=Number(option('--port',process.env.PORT||4173));
const files=new Map([['/','index.html'],['/index.html','index.html'],['/app.js','app.js'],['/core.js','core.js'],['/styles.css','styles.css'],['/ui.css','ui.css'],['/identidade.html','identidade.html'],['/assets/icon.svg','assets/icon.svg'],['/assets/logo.svg','assets/logo.svg'],['/favicon.ico','assets/icon.svg']]);
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml'};
const buckets=new Map();
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
function same(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)throw Error('Requisição muito grande.');}return JSON.parse(raw);}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/api/places'){
      if(req.method!=='POST')return json(res,405,{error:'Use POST.'});
      if(!process.env.GOOGLE_PLACES_API_KEY||!process.env.SEARCH_ACCESS_TOKEN)return json(res,503,{error:'Busca Google ainda não conectada. Configure a chave e o acesso no servidor ou conecte a função da Lovable em Ajustes.'});
      if(!same(req.headers.authorization||'','Bearer '+process.env.SEARCH_ACCESS_TOKEN))return json(res,401,{error:'Informe um token de acesso válido em Ajustes.'});
      const origin=req.headers.origin;
      if(origin&&origin!==`http://${req.headers.host}`&&origin!==process.env.APP_ORIGIN)return json(res,403,{error:'Origem não autorizada.'});
      const key=req.socket.remoteAddress,now=Date.now(),bucket=buckets.get(key)||{start:now,count:0};
      if(now-bucket.start>60000){bucket.start=now;bucket.count=0;}bucket.count++;buckets.set(key,bucket);
      if(bucket.count>20)return json(res,429,{error:'Limite de 20 buscas por minuto. Aguarde um momento.'});
      const result=await searchPlaces(await body(req),process.env.GOOGLE_PLACES_API_KEY);
      return json(res,200,result);
    }
    if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Método não permitido.'});
    const file=files.get(path);if(!file)return json(res,404,{error:'Página não encontrada.'});
    const content=await readFile(join(root,file));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
  }catch(err){json(res,err.status||400,{error:err.name==='TimeoutError'?'A busca excedeu o tempo limite.':err.message||'Erro na requisição.'});}
});
server.listen(port,host,()=>console.log(`NFC PRO ready on port ${port}`));
server.on('error',e=>{console.error(e.message);process.exit(1);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
