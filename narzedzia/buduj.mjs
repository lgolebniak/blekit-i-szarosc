// Składa grę z plików w src/ do jednego pliku index.html (działa offline, także jako artefakt i w paczce na Xboxa).
// Użycie: node narzedzia/buduj.mjs [--sprawdz]   (--sprawdz: tylko porównuje z index.html, nic nie zapisuje)
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),src=join(root,'src'),rd=f=>readFileSync(f,'utf8');
const js=readdirSync(join(src,'js')).filter(f=>f.endsWith('.js')).sort().map(f=>rd(join(src,'js',f))).join('');
const strip=s=>s.endsWith('\n')?s.slice(0,-1):s;
const html=rd(join(src,'szablon.html'))
  .replace('/*CZCIONKI*/',()=>strip(rd(join(src,'czcionki.css'))))
  .replace('/*STYL*/',()=>strip(rd(join(src,'styl.css'))))
  .replace('/*SKRYPT*/',()=>strip(js));
const out=join(root,'index.html');
if(process.argv.includes('--sprawdz')){if(rd(out)!==html){console.error('index.html jest nieaktualny – uruchom: node narzedzia/buduj.mjs');process.exit(1);}console.log('index.html zgodny ze źródłami');}
else{writeFileSync(out,html);console.log(`index.html: ${(html.length/1024).toFixed(0)} KB`);}
