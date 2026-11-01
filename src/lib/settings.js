(function(root){
'use strict';
const DEFAULTS={currency:'USD',hourlyWage:25,dailyHours:8,cooldownEnabled:false,cooldownMinutes:1440};
function normalizeSettings(s={}){const currency=['USD','CNY','EUR','GBP'].includes(s.currency)?s.currency:'USD';const positive=(v,d)=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):d;return {currency,hourlyWage:positive(s.hourlyWage,currency==='CNY'?30:25),dailyHours:positive(s.dailyHours,8),cooldownEnabled:s.cooldownEnabled===true,cooldownMinutes:positive(s.cooldownMinutes,1440)};}
const api={DEFAULTS,normalizeSettings};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
