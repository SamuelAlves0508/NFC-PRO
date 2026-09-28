import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'dist');
await mkdir(out,{recursive:true});
for(const file of ['index.html','identidade.html','styles.css','ui.css','core.js','app.js','assets'])await cp(join(root,file),join(out,file),{recursive:true});
const icon=await readFile(join(root,'assets/icon.svg'),'utf8');
const iconData='data:image/svg+xml,'+encodeURIComponent(icon);
let html=await readFile(join(root,'index.html'),'utf8');
for(const css of ['styles.css','ui.css'])html=html.replace(`<link rel="stylesheet" href="${css}">`,`<style>${await readFile(join(root,css),'utf8')}</style>`);
for(const js of ['core.js','app.js']){let source=await readFile(join(root,js),'utf8');if(js==='app.js')source=source.replaceAll('src="assets/icon.svg"',`src="${iconData}"`);html=html.replace(`<script src="${js}"></script>`,`<script>${source.replaceAll('</script','<\\/script')}</script>`);}
html=html.replace('href="assets/icon.svg"',`href="${iconData}"`);
await writeFile(join(out,'NFC-PRO.html'),html);
console.log('Built dist/ and dist/NFC-PRO.html (standalone).');
