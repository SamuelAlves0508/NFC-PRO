# NFC PRO

Aplicativo de gestão de placas NFC, evoluído a partir da versão 1.1 recuperada. HTML, CSS e JavaScript, sem dependências de produção.

## Abrir

- **Sem instalar:** abra `dist/NFC-PRO.html` no navegador. Esse arquivo contém CSS, JavaScript e ícone; não precisa de arquivos auxiliares para a gestão.
- **Desenvolvimento:** Node.js 20 ou superior, `npm start`, endereço `http://localhost:4173`.
- **Verificação:** `npm test`.
- **Build:** `npm run build`. A pasta `dist` é a saída estática para Hostinger, GitHub Pages ou outro host. A página de identidade é `dist/identidade.html`.

## Implementado

- Dashboard calculado a partir dos registros, gráfico mensal de recebimentos e estoque baixo.
- Modelos com tamanho, material, cor, custo, preço, estoque e upload de imagem PNG/JPG/WebP. Imagens são reduzidas para economizar espaço.
- Cadastro, edição, exclusão e busca de clientes; histórico de vendas e atalho WhatsApp.
- Vendas com quantidade, desconto, data, forma de pagamento, status e entrega. Venda pendente também reserva estoque. Cancelamento devolve unidades. O custo é congelado no momento da venda.
- Despesas adicionais, lucro realizado, margem, investimento e filtros por período, cliente, modelo e status.
- Relatórios CSV e impressão/PDF pelo navegador.
- Links de Instagram, WhatsApp com mensagem, grupo WhatsApp, site e Maps. Google aceita Place ID ou link direto de avaliação, sem prometer extrair Place ID de qualquer link compartilhado.
- Links salvos com copiar, abrir e excluir.
- Busca Google via endpoint de servidor, filtros de nota, quantidade de avaliações, telefone, site e aberto agora; ordenação por nota, avaliações ou nome. Cadastro manual de leads, etapas e conversão para cliente.
- Tema claro/escuro, backup JSON validado, restauração, importação da base local v1.1 e identidade visual com SVGs separados.

## Limites explícitos

Os registros ficam no `localStorage` deste navegador, não em uma conta na nuvem. Há limite de armazenamento do navegador, especialmente para muitas imagens. Faça backups. Abrir outro endereço ou dispositivo não transfere os dados automaticamente; use exportar/restaurar. Não há login, sincronização entre aparelhos, cobrança online ou escrita direta na tag NFC. Grave o link pelo NFC Tools.

A base inicia vazia para não confundir vendas fictícias com sua operação. Os registros v1.1 não são apagados e só são importados sob confirmação; essa versão continha dados de exemplo. O gráfico mostra recebimentos reais cadastrados. Lucro realizado = vendas pagas − custo das unidades pagas − despesas do período. Estoque adquirido não é descontado novamente do lucro.

O ajuste de estoque usa custo médio único por modelo, não controla lotes de compra. Mudanças no custo do modelo não alteram custos já registrados nas vendas. A pesquisa Google precisa de configuração e faturamento Google; não funciona só por abrir o HTML.

## Google Places

O servidor entrega `/api/places`. Configure variáveis reais no ambiente, nunca no JavaScript público:

```
GOOGLE_PLACES_API_KEY=...
SEARCH_ACCESS_TOKEN=...
APP_ORIGIN=https://seu-dominio
```

No Node 20.6+ é possível executar `node --env-file=.env server.mjs` depois de criar `.env` a partir de `.env.example`. A chave Google deve estar restrita à Places API (New) e ao ambiente adequado. O token pessoal de acesso é informado em Ajustes e mantido apenas na sessão do navegador. Não o publique no GitHub.

Sem configuração o servidor responde 503 com explicação, sem inventar comércios. A pesquisa usa Text Search (New), até 20 resultados por consulta. Filtros por telefone, site, quantidade de avaliações e ordenação são aplicados aos resultados recebidos, não a todo o catálogo Google. A função usa campos que podem gerar cobrança na Google Places API.

Para Lovable, consulte `integration/LOVABLE.md`. A integração externa não foi ativada com credenciais reais nesta entrega.

## GitHub

O código está pronto para um repositório privado `NFC-PRO`. Não há credenciais ou dados pessoais no código. O fluxo `.github/workflows/check.yml` valida os testes e gera o build a cada push. Não publica automaticamente nem amplia acesso.

## Estrutura

`app.js`: interface e persistência local. `core.js`: regras e validações. `styles.css`: base visual recuperada. `ui.css`: extensão visual. `server.mjs`: servidor opcional e proxy Google autenticado. `integration`: integração Google/Lovable. `assets`: marca. `tests`: regras críticas. `build.mjs`: empacotamento estático e arquivo único.
