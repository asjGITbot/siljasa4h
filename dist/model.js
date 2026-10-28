export const DEFAULT_SETTINGS = Object.freeze({weights:{roi:30,discount:20,risk:20,liquidity:15,capital:15},tax:0,contingency:5,budget:200000,fx:0});
export const TYPES = ['Departamento','Casa','Terreno','Oficina','Inmueble'];
export const RISKS = ['Bajo','Medio','Alto','Por verificar'];
export const OCCUPANCIES = ['Desocupado','Ocupado','Por verificar'];
export const CHECKS = ['Titularidad y cargas','Situación de ocupación','Comparables independientes'];
export const money = (value,currency='USD') => value===null||value===undefined||!Number.isFinite(value)?'Por estimar':new Intl.NumberFormat('es-PE',{style:'currency',currency:currency||'USD',maximumFractionDigits:0}).format(value);
export const pct = value => value === null ? '—' : new Intl.NumberFormat('es-PE',{maximumFractionDigits:1}).format(value)+'%';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  if (!value) return '';
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function materialize(o,settings=DEFAULT_SETTINGS) {
  const result={...o,...(o.assessment??{})};
  if(o.original_price!=null&&!o.assessment)result.acquisition_price=o.currency==='USD'?o.original_price:o.currency==='PEN'&&settings.fx>0?o.original_price/settings.fx:null;
  return result;
}
export function financials(raw, settings = DEFAULT_SETTINGS, scenario = 'base') {
  const o=materialize(raw,settings);
  const required=['acquisition_price','exit_price','closing_costs','renovation','holding_costs','selling_costs'];
  if(required.some(k=>o[k]==null||!Number.isFinite(o[k])))return {ready:false,total:null,exit:null,profit:null,roi:null,contingency:null,tax:null,afterTaxEstimate:null};
  const multiplier = {conservative:0.9,base:1,optimistic:1.1}[scenario] ?? 1;
  const contingency = (o.acquisition_price + o.renovation) * settings.contingency / 100;
  const total = o.acquisition_price + o.closing_costs + o.renovation + o.holding_costs + o.selling_costs + contingency+(o.legal_costs??0)+(o.financing_costs??0)+(o.acquisition_taxes??0);
  const exit = o.exit_price * multiplier;
  const profit = exit - total;
  const tax = Math.max(0,profit) * settings.tax / 100;
  return {ready:true,total,exit,profit,roi:total > 0 ? profit / total * 100 : null,contingency,tax,afterTaxEstimate:profit-tax};
}
const clamp = x => Math.max(0, Math.min(100,x));
export function scoreOpportunity(raw, settings = DEFAULT_SETTINGS) {
  const o=materialize(raw,settings);
  const f = financials(o,settings);
  if(!f.ready||o.months==null||o.risk==='Por verificar'||o.type==='Inmueble')return {value:null,parts:{},eligible:false};
  const parts = {
    roi:clamp((f.roi ?? 0) / 30 * 100),
    discount:clamp(o.exit_price > 0 ? (1-o.acquisition_price/o.exit_price)*400 : 0),
    risk:{Bajo:85,Medio:55,Alto:20}[o.risk] ?? 0,
    liquidity:{Departamento:80,Casa:60,Oficina:45,Terreno:35}[o.type] ?? 0,
    capital:clamp(100-o.months*4-f.total/15000)
  };
  const weights=settings.weights;
  const totalWeight=Object.values(weights).reduce((a,b)=>a+b,0);
  return {value: totalWeight ? Math.round(Object.entries(parts).reduce((n,[k,v])=>n+v*weights[k],0)/totalWeight) : 0,parts,
    eligible:!o.demo && CHECKS.every(c=>o.checks?.includes(c))};
}
function num(value,name,{positive=false,max=1e10}={}) {
  if (value === '' || value === null || value === undefined || !/^\d+(\.\d+)?$/.test(String(value).trim())) throw new Error(`${name}: usa un número sin separadores de miles.`);
  const n=Number(value);
  if (!Number.isFinite(n)||n<0||n>max||(positive&&n===0)) throw new Error(`${name}: importe fuera del rango permitido.`);
  return n;
}
export function validateOpportunity(raw,source='Manual',now=new Date().toISOString()) {
  const title=String(raw.title??'').trim(), district=String(raw.district??'').trim();
  if (title.length<3||title.length>140) throw new Error('Título: entre 3 y 140 caracteres.');
  if (district.length<2||district.length>60) throw new Error('Distrito: entre 2 y 60 caracteres.');
  if (!TYPES.includes(raw.type)) throw new Error('Tipo de inmueble no válido.');
  const source_url=safeURL(String(raw.source_url??'').trim());
  if (raw.source_url && !source_url) throw new Error('URL original: usa http o https sin credenciales.');
  const risk=raw.risk||'Alto', occupancy=raw.occupancy||'Por verificar';
  if (!RISKS.includes(risk)||!OCCUPANCIES.includes(occupancy)) throw new Error('Riesgo u ocupación no válidos.');
  const evidence=String(raw.evidence??'').trim();
  if (!evidence || evidence.length>2000) throw new Error('Evidencia: describe el origen y la fecha (máximo 2000 caracteres).');
  const o={title,district,type:raw.type,source,source_url,risk,occupancy,evidence,captured_at:now,updated_at:now,checks:[],demo:false,confidence:'Sin verificar'};
  for (const k of ['acquisition_price','exit_price','area','months','closing_costs','renovation','holding_costs','selling_costs']) o[k]=num(raw[k],k,{positive:['acquisition_price','exit_price','area','months'].includes(k)});
  if (o.months>120) throw new Error('Plazo: máximo 120 meses.');
  return o;
}
// RFC-4180-style parsing: commas/semicolons, quoted newlines, escaped quotes; no evaluation.
export function parseCSV(text) {
  if (text.length>2_000_000) throw new Error('CSV demasiado grande. Máximo 2 MB.');
  text=text.replace(/^\uFEFF/,'');
  const first=text.split(/\r?\n/)[0];
  const delimiter=first.includes(';')?';':',';
  const rows=[]; let row=[],cell='',quoted=false,closed=false;
  for (let i=0;i<=text.length;i++) {
    const c=text[i];
    if (quoted) {
      if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(c==='"'){quoted=false;closed=true;}
      else if(c===undefined) throw new Error('CSV: comillas sin cerrar.');
      else cell+=c;
    } else if(c==='"') {
      if(cell||closed) throw new Error('CSV: comillas fuera de lugar.');
      quoted=true;
    } else if(c===delimiter||c==='\n'||c===undefined) {
      row.push(cell.replace(/\r$/,''));cell='';closed=false;
      if(c!==delimiter){ if(row.some(v=>v.trim()))rows.push(row);row=[]; }
    } else if(closed&&c!=='\r') throw new Error('CSV: caracteres después de comillas.');
    else cell+=c;
  }
  if(rows.length<2)throw new Error('CSV vacío: incluye cabecera y al menos una fila.');
  if(rows.length>501)throw new Error('Importa como máximo 500 filas por ejecución.');
  const headers=rows.shift().map(s=>s.trim());
  const required=['title','district','type','acquisition_price','exit_price','area','months','closing_costs','renovation','holding_costs','selling_costs','evidence'];
  if(new Set(headers).size!==headers.length)throw new Error('CSV: cabeceras duplicadas.');
  if(required.some(k=>!headers.includes(k)))throw new Error('CSV: faltan columnas. Descarga la plantilla de ejemplo.');
  return rows.map((values,i)=>{if(values.length!==headers.length)throw new Error(`Fila ${i+2}: número incorrecto de columnas.`);return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));});
}
export function identity(o) {
  // Never merge by approximate title/address. Only a full, exact origin URL is authoritative.
  return o.source_url ? `${o.demo?'demo':'local'}|${o.source_url}` : null;
}
export function mergeOpportunities(existing,incoming,makeId=()=>crypto.randomUUID()) {
  const output=existing.map(o=>({...o}));const counts={new:0,updated:0,duplicate:0};
  for(const item of incoming){
    const key=identity(item),index=key ? output.findIndex(o=>identity(o)===key) : -1;
    if(index<0){output.push({...item,id:makeId()});counts.new++;continue;}
    const old=output[index];
    const fields=['title','district','type','source_url','acquisition_price','exit_price','area','months','closing_costs','renovation','holding_costs','selling_costs','risk','occupancy','evidence'];
    if(fields.every(k=>old[k]===item[k])){counts.duplicate++;continue;}
    // Reimport invalidates critical checks and retains capture time and stable dossier id.
    output[index]={...item,id:old.id,captured_at:old.captured_at,checks:[]};counts.updated++;
  }
  return {items:output,counts};
}
export function filterOpportunities(items, filters,settings) {
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return items.filter(raw=>{
    const o=materialize(raw,settings);
    const f=financials(o,settings);
    return (!filters.query||norm(`${o.title} ${o.district}`).includes(norm(filters.query))) &&
      ['district','type','risk','source','occupancy','region','currency'].every(k=>!filters[k]||o[k]===filters[k]) &&
      (!filters.minPrice||((o.original_price??o.acquisition_price)!=null&&(o.original_price??o.acquisition_price)>=Number(filters.minPrice)))&&(!filters.maxPrice||((o.original_price??o.acquisition_price)!=null&&(o.original_price??o.acquisition_price)<=Number(filters.maxPrice)))&&
      (!filters.maxCapital||(f.total!==null&&f.total<=Number(filters.maxCapital)))&&(!filters.minArea||(o.area!==null&&o.area>=Number(filters.minArea)))&&
      (!filters.minROI||(f.roi!==null&&f.roi>=Number(filters.minROI)))&&(!filters.maxMonths||(o.months!=null&&o.months<=Number(filters.maxMonths)))&&
      (!filters.minDiscount||(o.exit_price>0&&o.acquisition_price!=null&&(1-o.acquisition_price/o.exit_price)*100>=Number(filters.minDiscount)))&&
      (!filters.deadlineBefore||(o.deadline&&o.deadline.slice(0,10)<=filters.deadlineBefore))&&
      (!filters.capturedAfter||o.captured_at.slice(0,10)>=filters.capturedAfter)&&(!filters.updatedAfter||o.updated_at.slice(0,10)>=filters.updatedAfter);
  });
}
export function sortOpportunities(items,by,settings) {
  const val=o=>by==='price'? (financials(o,settings).total!=null?-financials(o,settings).total:-Infinity):by==='roi'?(financials(o,settings).roi??-Infinity):by==='profit'?(financials(o,settings).profit??-Infinity):by==='new'?Date.parse(o.captured_at):(scoreOpportunity(o,settings).value??-Infinity);
  return [...items].sort((a,b)=>val(b)-val(a));
}
export function validateSettings(s) {
  const keys=Object.keys(DEFAULT_SETTINGS.weights);
  if(!s||!s.weights||keys.some(k=>!Number.isFinite(s.weights[k])||s.weights[k]<0||s.weights[k]>100)||keys.reduce((n,k)=>n+s.weights[k],0)!==100)throw new Error('Los cinco pesos deben sumar 100.');
  if(!Number.isFinite(s.tax)||s.tax<0||s.tax>100||!Number.isFinite(s.contingency)||s.contingency<0||s.contingency>100)throw new Error('Impuesto y contingencia: entre 0 y 100%.');
  return s;
}
export const CSV_HEADER=['title','district','type','acquisition_price','exit_price','area','months','closing_costs','renovation','holding_costs','selling_costs','risk','occupancy','source_url','evidence'];
export function csvExport(items) {
  const encode=v=>'"'+String(v??'').replace(/^(\s*[=+@\-]|[\t\r\n])/ ,"'$&").replaceAll('"','""')+'"';
  return '\uFEFF'+[CSV_HEADER,...items.map(o=>CSV_HEADER.map(k=>o[k]))].map(row=>row.map(encode).join(',')).join('\r\n');
}
