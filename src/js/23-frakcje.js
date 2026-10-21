/* ================= FRAKCJE I WARIANTY (każda strona może mieć inny skład) ================= */
const FACTIONS={
  union:{keys:['inf','cav','lan','art'],presets:PRESETS,max:{inf:12,cav:8,lan:6,art:4},info:null,colors:null,idx:0},
  confed:{keys:['inf','cav','lan','art'],presets:PRESETS,max:{inf:12,cav:8,lan:6,art:4},info:null,colors:null,idx:1},
  caesar:{keys:['leg','arc','eq','bal','ona'],presets:ERAS.rome.presets,max:ERAS.rome.max,info:ERAS.rome.info,colors:ERAS.rome.sides[0]},
  pompey:{keys:['leg','arc','eq','bal','ona'],presets:ERAS.rome.presets,max:ERAS.rome.max,info:ERAS.rome.info,colors:ERAS.rome.sides[1]},
  carth:{keys:['lib','sli','num','ele'],
    presets:[{n:'Armia Hannibala',lib:5,sli:3,num:2,ele:2},{n:'Słonie',lib:4,sli:2,num:2,ele:4},{n:'Jazda',lib:4,sli:2,num:5,ele:1},{n:'Falanga',lib:7,sli:3,num:1,ele:1}],
    max:{lib:10,sli:6,num:6,ele:4},
    info:{lib:['Piechota libijska','8 ludzi · włócznie','A: linia ↔ falanga (mocna z przodu).'],sli:['Procarze balearscy','6 ludzi · kamienie z proc','Krótko A: na wprost. Trzymaj: łukiem ponad przeszkodami.'],
      num:['Jazda numidyjska','4 jeźdźców · oszczepy','Ruch w każdą stronę, także w tył. A: rzut.'],ele:['Słonie bojowe','4 rany · tratują wszystko','A: szarża. Ranny słoń może wpaść w panikę.']},
    colors:{name:'Kartagina',gen:'Kartaginy',coat:'#7a3a7a',coatD:'#552555',pants:'#c99a6e',hat:'#b8904a',ui:'#e2a8ff',uiD:'#5a2a6a',flag:['#6a2a6a','#e0c060'],shield:'#b08a3a',crest:'#6a2a6a'}},
  gaul:{keys:['war','sli','gcav'],
    presets:[{n:'Plemiona',war:7,sli:3,gcav:2},{n:'Nawała',war:9,sli:1,gcav:2},{n:'Jeźdźcy',war:6,sli:2,gcav:4},{n:'Procarze',war:6,sli:4,gcav:2}],
    max:{war:12,sli:6,gcav:6},
    info:{war:['Wojownicy','8 ludzi · miecze','A: furia – szarża, podwójny impet, potem zmęczenie.'],sli:['Procarze','6 ludzi · kamienie z proc','Krótko A: na wprost. Trzymaj: łukiem ponad przeszkodami.'],
      gcav:['Jazda galijska','4 jeźdźców','Szyk, galop, dęba. A: cios.']},
    colors:{name:'Galowie',gen:'Galów',coat:'#5a7a3a',coatD:'#3e5a28',pants:'#8a5a2a',hat:'#c07a30',ui:'#b0e07a',uiD:'#3e5a28',flag:['#3e6a2a','#e0c060'],shield:'#6a8a3a',crest:'#c07a30'}},
  pl:{keys:['rif','mg','ppk','tank','at','mor'],max:{rif:10,mg:4,ppk:3,tank:4,at:3,mor:3},colors:ERAS.ww2.sides[0],
    presets:[{n:'Batalion',rif:4,mg:2,ppk:1,tank:2,at:2,mor:1},{n:'Pancerni',rif:3,mg:1,ppk:1,tank:4,at:2,mor:1},{n:'Obrona',rif:4,mg:3,ppk:2,tank:1,at:1,mor:1},{n:'Ogień',rif:4,mg:2,ppk:1,tank:1,at:1,mor:3}],
    info:Object.assign({ppk:['Rusznica ppanc','2 ludzi · kb ppanc','Przebija czołg z boku i z bliska. A: strzał.']},ERAS.ww2.info)},
  de:null
};
FACTIONS.de=Object.assign({},FACTIONS.pl,{colors:ERAS.ww2.sides[1]});
const VARIANTS={
  acw:{era:'acw',fac:['union','confed'],sub:'1861 – 1865'},
  rome:{era:'rome',fac:['caesar','pompey'],sub:'Cezar kontra Pompejusz'},
  rome_c:{era:'rome',fac:['caesar','carth'],sub:'Rzym kontra Kartagina'},
  rome_g:{era:'rome',fac:['caesar','gaul'],sub:'Rzym kontra Galowie'},
  ww2:{era:'ww2',fac:['pl','de'],sub:'Polska kontra Niemcy'}};
const VAR_ORDER=['acw','rome','rome_c','rome_g','ww2'];
let FAC=[FACTIONS.union,FACTIONS.confed];
const TY=s=>FAC[s].keys,PR=s=>FAC[s].presets,MX=s=>FAC[s].max,INFO=s=>FAC[s].info||TYPEINFO;
// strony: 0 = historyczne, 1 i 2 = obie armie jak jedna ze stron (każda zostaje w swoich barwach, druga z dopiskiem „II”)
const sideName=(V,i)=>{const c=FACTIONS[V.fac[i]].colors;return(c||SIDE_ACW[i]).name;};
function sideFacs(V){const F=V.fac.map(f=>FACTIONS[f]),m=G.sides||0;if(!m)return F;const A=F[m-1],an=sideName(V,m-1),ag=(A.colors||SIDE_ACW[m-1]).gen;
  return[0,1].map(i=>{const c=F[i].colors;if(!c&&!A.colors)return A;return Object.assign({},A,{colors:Object.assign({},c||SIDE_ACW[i],{name:an+(i?' II':''),gen:ag+(i?' II':''),lose:undefined})});});}
function setVariant(v){const V=VARIANTS[v];G.variant=v;G.era=V.era;ERA=ERAS[V.era];FAC=sideFacs(V);
  TYPES=[...new Set([...FAC[0].keys,...FAC[1].keys])];PRESETS=FAC[0].presets;MAXT=FAC[0].max;
  for(let i=0;i<2;i++){for(const k of Object.keys(SIDE[i]))delete SIDE[i][k];Object.assign(SIDE[i],SIDE_ACW[i]);if(FAC[i].colors)Object.assign(SIDE[i],FAC[i].colors);}
  for(let p=0;p<2;p++){const a=G.army[p];for(const k in a)if(KD[k])delete a[k];Object.assign(a,PR(p)[0]);delete a.n;a.preset=0;a.ready=false;a.row=0;}
  if(V.era!=='acw')G.rules='classic';G.mapSel=0;}
G.variant='acw';

