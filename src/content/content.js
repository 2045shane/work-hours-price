(function(){
'use strict';
const W=WorkHoursPrice;if(!W.getSite(location.href))return;
const host=document.createElement('div');host.id='whp-floating';const shadow=host.attachShadow({mode:'closed'});
const style=document.createElement('style');style.textContent=':host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647;font:14px/1.7 "Microsoft YaHei",sans-serif;color:#241c16}section{max-width:300px;background:#fbf6ee;border:1px solid #e4d5c2;border-radius:14px;padding:14px;box-shadow:0 10px 28px #301c1618}button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:8px 12px;background:#9e2f2a;color:#fff}p{margin:8px 0 0}';
const panel=document.createElement('section'),trigger=document.createElement('button'),status=document.createElement('p');trigger.textContent='价格换算 · 换算本页';status.setAttribute('role','status');panel.append(trigger,status);shadow.append(style,panel);document.documentElement.append(host);
let busy=false,annotation=null,timer=null;
async function scan(){
 if(busy)return {ok:false,error:'正在换算，请稍候。'};busy=true;trigger.disabled=true;
 try{
  const permission=await chrome.runtime.sendMessage({type:'WHP_CONSUME'});if(!permission?.ok)throw new Error(permission?.error||'无法读取配额。');
  const {whpSettings}=await chrome.storage.local.get('whpSettings');const settings=W.normalizeSettings(whpSettings);
  const found=W.findPrice(document,location.href,W.parsePrice);if(!found)throw new Error('未找到主价格。请在商品详情页使用；若商品需要先选尺码/颜色，请选好后再试。');
  if(found.price.currency!==settings.currency)throw new Error(`商品币种 ${found.price.currency} 与时薪币种 ${settings.currency} 不同，请在插件中修改；不做汇率换算。`);
  const hours=W.toHours(found.price.amount,settings.hourlyWage);clearInterval(timer);annotation?.remove();
  annotation=document.createElement('div');annotation.setAttribute('data-whp-annotation','');
  const box=annotation.attachShadow({mode:'closed'}),css=document.createElement('style');css.textContent=':host{display:block;margin:8px 0}section{font:14px/1.7 "Microsoft YaHei",sans-serif;background:#fbf6ee;color:#241c16;padding:10px 14px;border:1px solid #e4d5c2;border-left:3px solid #9e2f2a;border-radius:8px}strong{color:#9e2f2a}p{margin:4px 0}button{font:inherit;cursor:pointer;padding:4px 10px;background:#fff;border:1px solid #e4d5c2;border-radius:6px}';
  const section=document.createElement('section'),title=document.createElement('strong'),detail=document.createElement('p');title.textContent=`≈ ${W.compact(hours)} 小时工作`;detail.textContent=W.formatHours(hours,settings.dailyHours);section.append(title,detail);box.append(css,section);
  let anchor=found.element;
  if(anchor.matches('meta')||anchor.closest('head'))anchor=document.querySelector('h1')||document.body;
  else anchor=anchor.closest('.a-price')||anchor;
  if(anchor===document.body)anchor.append(annotation);else anchor.insertAdjacentElement('afterend',annotation);
  if(settings.cooldownEnabled){
   const response=await chrome.runtime.sendMessage({type:'WHP_COOLDOWN'});if(!response?.ok)throw new Error(response?.error||'冷静期读取失败');
   const url=location.href;let records=response.records;const line=document.createElement('p'),ack=document.createElement('button');ack.textContent='我已冷静';section.append(line,ack);
   const update=()=>{const ms=W.remainingMs(records,url);line.textContent=ms>0?`冲动消费冷静期：还剩 ${W.formatRemaining(ms)}`:'冷静期已结束，可以再想想是否需要。';ack.disabled=ms===0;if(ms===0)clearInterval(timer);};
   ack.addEventListener('click',async()=>{try{const r=await chrome.runtime.sendMessage({type:'WHP_ACK'});if(!r.ok)throw new Error(r.error);records=r.records;update();}catch(e){status.textContent=e.message;}});timer=setInterval(update,1000);update();
  }
  status.textContent='已在主价格旁标注；本次扫描计 1 次。';return {ok:true};
 }catch(error){status.textContent=error.message;return {ok:false,error:error.message};}
 finally{busy=false;trigger.disabled=false;}
}
trigger.addEventListener('click',scan);
chrome.runtime.onMessage.addListener((message,sender,reply)=>{if(message?.type!=='WHP_SCAN')return;scan().then(reply);return true;});
})();
