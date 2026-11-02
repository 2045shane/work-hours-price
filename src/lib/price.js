(function(root){
'use strict';
function parsePrice(text,fallback='USD'){
 if(typeof text!=='string')return null;
 const currency=/US\$|USD|\$/.test(text)?'USD':/€|EUR/.test(text)?'EUR':/£|GBP/.test(text)?'GBP':/JPY|円/.test(text)?'JPY':/¥|￥|CNY|RMB/.test(text)?(fallback==='JPY'?'JPY':'CNY'):fallback;
 const parts=text.replace(/[\u00a0\u202f]/g,' ').match(/\d+(?:[.,' ]\d+)*/g);
 if(!parts)return null;
 const values=parts.map(raw=>{
  let s=raw.replace(/[ '\s]/g,'');const dot=s.lastIndexOf('.'),comma=s.lastIndexOf(',');
  if(dot>=0&&comma>=0){const decimal=dot>comma?'.':',';s=s.replace(decimal==='.'?/,/g:/\./g,'').replace(decimal,'.');}
  else if(comma>=0){s=/^\d{1,3}(,\d{3})+$/.test(s)?s.replace(/,/g,''):s.replace(',','.');}
  else if((s.match(/\./g)||[]).length>1||(/^\d{1,3}\.\d{3}$/.test(s)&&currency==='EUR'))s=s.replace(/\./g,'');
  return Number(s);
 }).filter(n=>Number.isFinite(n)&&n>=0);
 if(!values.length)return null;
 // 仅明确区间取低值；其他混合文本使用第一个金额。
 return {amount:/[-–—~～至]/.test(text)?Math.min(...values):values[0],currency};
}
function toHours(amount,wage){if(!Number.isFinite(amount)||amount<0||!Number.isFinite(wage)||wage<=0)throw new RangeError('价格或时薪无效');return amount/wage;}
function compact(value){return Number(value.toFixed(2)).toString();}
function formatHours(hours,daily=8){if(!Number.isFinite(hours)||hours<0||!Number.isFinite(daily)||daily<=0)throw new RangeError('工时无效');return `约 ${compact(hours)} 小时（${compact(hours/daily)} 个工作日，按每天 ${compact(daily)} 小时）`;}
const api={parsePrice,toHours,formatHours,compact};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
