// Illustrative fixtures, never mixed with automatically captured records.
export const DEMO = [
  ['D-001','Departamento con terraza','Miraflores','Departamento',128000,179000,96,7,'Medio'],
  ['D-002','Departamento familiar','Jesús María','Departamento',98000,142000,84,6,'Bajo'],
  ['D-003','Casa para renovación','San Borja','Casa',245000,348000,210,12,'Alto'],
  ['D-004','Oficina en centro empresarial','San Isidro','Oficina',182000,239000,120,9,'Medio'],
  ['D-005','Terreno residencial','La Molina','Terreno',420000,510000,480,18,'Medio'],
  ['D-006','Departamento de estreno','Surquillo','Departamento',88000,123000,68,5,'Bajo'],
].map(([id,title,district,type,price,exit,area,months,risk],i)=>({id,title,district,type,acquisition_price:price,exit_price:exit,area,months,risk,
  source:'Demo sintética',source_url:'',currency:'USD',region:'Lima',original_price:price,demo:true,
  closing_costs:price*.025,renovation:12000+i*1000,holding_costs:months*500,selling_costs:exit*.03,legal_costs:0,financing_costs:0,acquisition_taxes:0,
  occupancy:i%2?'Desocupado':'Por verificar',captured_at:'2026-10-28T13:00:00Z',updated_at:'2026-10-28T13:00:00Z',checks:[],
  evidence:'DEMO — NO REAL. Inmueble y cifras completamente sintéticos para probar la interfaz.',confidence:'DEMO — NO REAL',risk_flags:['No es una oferta real'],deadline:null}));
