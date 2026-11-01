 'use strict';
importScripts('../lib/license.js','../lib/quota.js','../lib/settings.js','../lib/cooldown.js','../content/selectors.js');
const W=WorkHoursPrice,store=W.createQuotaStore(chrome.storage.local);let queue=Promise.resolve();
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(!['WHP_STATUS','WHP_CONSUME','WHP_SAVE_LICENSE','WHP_COOLDOWN','WHP_ACK'].includes(message?.type))return;
 const task=queue.then(async()=>{
  if(message.type==='WHP_STATUS')return {ok:true,quota:await store.status()};
  if(message.type==='WHP_SAVE_LICENSE'){
   if(sender.tab||sender.url!==chrome.runtime.getURL('src/options/options.html'))return {ok:false,error:'请在设置页保存许可。'};
   const token=typeof message.license==='string'?message.license.trim():'';
   if(token&&!await W.verifyLicense(token))return {ok:false,error:'许可无效，请检查 WHP1. 前缀与完整内容。'};
   await chrome.storage.local.set({whpLicense:token});return {ok:true};
  }
  if(!sender.tab||!W.getSite(sender.url))return {ok:false,error:'请在支持的购物网站操作。'};
  if(message.type==='WHP_CONSUME'){const quota=await store.consume();return {ok:quota.recorded,quota,error:quota.recorded?null:W.CTA};}
  const {whpCooldowns={},whpSettings={}}=await chrome.storage.local.get(['whpCooldowns','whpSettings']);const settings=W.normalizeSettings(whpSettings),url=sender.url;
  const records=message.type==='WHP_ACK'?W.finishCooldown(whpCooldowns,url):settings.cooldownEnabled?W.startCooldown(whpCooldowns,url,settings.cooldownMinutes):whpCooldowns;
  await chrome.storage.local.set({whpCooldowns:records});return {ok:true,records};
 });queue=task.catch(()=>{});task.then(reply).catch(()=>reply({ok:false,error:'本地存储操作失败，请重试。'}));return true;
});
