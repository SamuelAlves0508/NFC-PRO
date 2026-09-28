// Deploy as a Supabase/Lovable Edge Function named places-search.
// Keep GOOGLE_PLACES_API_KEY, SEARCH_ACCESS_TOKEN and APP_ORIGIN in server secrets.
import { searchPlaces } from './places.mjs';
const allowedOrigin=Deno.env.get('APP_ORIGIN')||'';
Deno.serve(async(request:Request)=>{
  const origin=request.headers.get('origin')||'';
  const headers:Record<string,string>={'Content-Type':'application/json','Vary':'Origin'};
  if(origin===allowedOrigin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization, content-type, apikey, x-client-info';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
  const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
  if(!allowedOrigin||origin!==allowedOrigin)return reply(403,{error:'Origem não autorizada.'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'Use POST.'});
  const key=Deno.env.get('GOOGLE_PLACES_API_KEY'),token=Deno.env.get('SEARCH_ACCESS_TOKEN');
  if(!key||!token)return reply(503,{error:'Integração Google ainda não configurada.'});
  if(request.headers.get('authorization')!=='Bearer '+token)return reply(401,{error:'Acesso não autorizado.'});
  try{const raw=await request.text();if(raw.length>8192)return reply(413,{error:'Requisição muito grande.'});return reply(200,await searchPlaces(JSON.parse(raw),key));}
  catch(e){return reply(400,{error:e instanceof Error?e.message:'Falha na busca.'});}
});
