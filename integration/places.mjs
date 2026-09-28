export async function searchPlaces(input,key,fetcher=fetch){
  if(typeof input.query!=='string'||!input.query.trim()||input.query.length>150||typeof input.city!=='string'||!input.city.trim()||input.city.length>120)throw Error('Informe segmento e cidade válidos.');
  const rating=Number(input.minRating||0);if(!Number.isFinite(rating)||rating<0||rating>5)throw Error('Nota mínima inválida.');
  const response=await fetcher('https://places.googleapis.com/v1/places:searchText',{
    method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.currentOpeningHours,places.googleMapsUri,places.googleMapsLinks'},
    body:JSON.stringify({textQuery:input.query.trim()+' em '+input.city.trim(),languageCode:'pt-BR',regionCode:'BR',pageSize:20,minRating:rating,openNow:!!input.openNow}),signal:AbortSignal.timeout(15000)
  });
  if(!response.ok){const err=Error(response.status===429?'A cota Google foi atingida.':'A busca Google falhou. Verifique chave, faturamento e permissões no servidor.');err.status=502;throw err;}
  const result=await response.json();return {places:Array.isArray(result.places)?result.places:[]};
}
