'use strict';
const W=WorkHoursPrice,$=id=>document.getElementById(id);let ready=false;
async function refresh(){const r=await chrome.runtime.sendMessage({type:'WHP_STATUS'});if(!r?.ok)throw new Error(r?.error||'配额读取失败');$('quota').textContent=W.quotaText(r.quota);}
async function save(){if(!$('settings').reportValidity())throw new Error('请填写有效的正数。');const settings=W.normalizeSettings({currency:$('currency').value,hourlyWage:Number($('wage').value),dailyHours:Number($('daily').value),cooldownEnabled:$('cooldown').checked,cooldownMinutes:Number($('minutes').value)});await chrome.storage.local.set({whpSettings:settings});}
$('currency').addEventListener('change',()=>{$('wage').value=$('currency').value==='CNY'?30:25;});
$('settings').addEventListener('submit',async e=>{e.preventDefault();try{await save();$('status').textContent='设置已保存。';}catch(e){$('status').textContent=e.message;}});
$('options').addEventListener('click',()=>chrome.runtime.openOptionsPage());
$('scan').addEventListener('click',async()=>{
 if(!ready)return;$('scan').disabled=true;
 try{await save();const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw new Error('请先打开支持的购物商品页。');let r;try{r=await chrome.tabs.sendMessage(tab.id,{type:'WHP_SCAN'});}catch{throw new Error('请打开支持的购物站商品页；安装或重载插件后，请刷新商品页。');}if(!r?.ok)throw new Error(r?.error||'换算失败');$('status').textContent='已在本页主价格旁标注。';}
 catch(e){$('status').textContent=e.message;}finally{try{await refresh();}catch(e){$('status').textContent=e.message;}$('scan').disabled=false;}
});
(async()=>{try{const {whpSettings}=await chrome.storage.local.get('whpSettings');const s=W.normalizeSettings(whpSettings);$('currency').value=s.currency;$('wage').value=s.hourlyWage;$('daily').value=s.dailyHours;$('cooldown').checked=s.cooldownEnabled;$('minutes').value=s.cooldownMinutes;await refresh();ready=true;}catch(e){$('status').textContent=e.message;}})();
