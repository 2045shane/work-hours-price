(function(root){
'use strict';
function urlKey(url){const u=new URL(url);u.hash='';return u.href;}
function startCooldown(records,url,minutes=1440,now=Date.now()){
 if(!Number.isFinite(minutes)||minutes<=0)throw new RangeError('冷静期分钟数无效');
 const key=urlKey(url);if(Object.hasOwn(records,key))return {...records};
 return {...records,[key]:{startedAt:now,durationMs:minutes*60000,acknowledged:false}};
}
function remainingMs(records,url,now=Date.now()){const r=records[urlKey(url)];return !r||r.acknowledged?0:Math.max(0,r.startedAt+r.durationMs-now);}
function finishCooldown(records,url){const key=urlKey(url);return records[key]?{...records,[key]:{...records[key],acknowledged:true}}:{...records};}
function formatRemaining(ms){if(ms<=0)return '冷静期已结束';const s=Math.ceil(ms/1000);return [Math.floor(s/3600)?`${Math.floor(s/3600)} 小时`:null,Math.floor(s%3600/60)?`${Math.floor(s%3600/60)} 分`:null,`${s%60} 秒`].filter(Boolean).join(' ');}
const api={urlKey,startCooldown,remainingMs,finishCooldown,formatRemaining};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
