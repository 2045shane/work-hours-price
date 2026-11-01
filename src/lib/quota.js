(function(root){
'use strict';
const license=typeof module!=='undefined'&&module.exports?require('./license'):root.WorkHoursPrice;
const STORAGE_KEYS={quota:'whpQuota',license:'whpLicense'};
const CTA='免费次数已用完，解锁请小红书私信「珊哥爱读书」';
function localDateKey(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
function readQuota(stored,now=new Date(),unlocked=false){const date=localDateKey(now);const count=stored?.date===date&&Number.isSafeInteger(stored.count)&&stored.count>=0?stored.count:0;return {date,count,unlocked,remaining:unlocked?null:Math.max(0,3-count),allowed:unlocked||count<3};}
function createQuotaStore(storage,now=()=>new Date()){
 let queue=Promise.resolve();
 async function status(){const data=await storage.get([STORAGE_KEYS.quota,STORAGE_KEYS.license]);return readQuota(data[STORAGE_KEYS.quota],now(),await license.verifyLicense(data[STORAGE_KEYS.license]));}
 function consume(){const task=queue.then(async()=>{const current=await status();if(!current.allowed)return {...current,recorded:false};if(current.unlocked)return {...current,recorded:true};const stored={date:current.date,count:current.count+1};await storage.set({[STORAGE_KEYS.quota]:stored});return {...readQuota(stored,now()),recorded:true};});queue=task.catch(()=>{});return task;}
 return {status,consume};
}
const api={STORAGE_KEYS,CTA,localDateKey,readQuota,createQuotaStore};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
