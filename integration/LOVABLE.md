# Conexão na Lovable

Preserve o frontend e as regras do NFC PRO. O único recurso externo necessário à busca é uma função de servidor.

1. Crie uma Edge Function `places-search` no backend Supabase/Lovable. Use `lovable-function.ts` como `index.ts` e copie `places.mjs` para o mesmo diretório.
2. Configure `GOOGLE_PLACES_API_KEY`, `SEARCH_ACCESS_TOKEN` (um segredo longo aleatório) e `APP_ORIGIN` (a origem HTTPS exata do frontend) nos secrets do servidor.
3. Como a função valida o token pessoal no próprio código, desative a validação JWT automática somente nessa função. Não deixe a função sem o teste de Authorization. Para um app multiusuário, substitua o token pessoal por verificação do JWT Supabase e regras de acesso por usuário.
4. Configure cota diária na Google API e limite de requisições no gateway. O servidor Node incluído limita 20 buscas/minuto por IP; a função Edge deve usar o rate limiting da plataforma antes de abrir a usuários adicionais.
5. Em Ajustes do NFC PRO, informe a URL HTTPS da função e o token pessoal. A chave Google nunca entra no frontend. O token precisa ser inserido de novo em outra sessão.
6. Teste com um negócio conhecido. Use `places.googleMapsLinks.writeAReviewUri` para o botão de avaliação quando retornado. Confira que filtros e mensagens de erro funcionam.

Contrato: POST JSON `{ "query": "academia", "city": "Ibiporã", "minRating": 4, "openNow": false }`. Resposta `{ "places": [...] }` no formato Places API (New). Erros: `{ "error": "mensagem" }` com status diferente de 2xx.

O app não manda clientes, vendas nem artes à função de busca. Só envia segmento, cidade e filtros. A função não salva os resultados; um comércio só vai para o armazenamento local quando o usuário escolhe salvá-lo.

Documentação consultada: https://developers.google.com/maps/documentation/places/web-service/text-search e https://developers.google.com/maps/documentation/places/web-service/maps-links . Revise os termos aplicáveis antes de usar os dados em produção.
