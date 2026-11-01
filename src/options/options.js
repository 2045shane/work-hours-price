'use strict';
const $=id=>document.getElementById(id);
async function refresh(){const r=await chrome.runtime.sendMessage({type:'WHP_STATUS'});if(!r?.ok)throw new Error(r?.error||'读取失败');$('quota').textContent=WorkHoursPrice.quotaText(r.quota);}
async function save(license){try{const r=await chrome.runtime.sendMessage({type:'WHP_SAVE_LICENSE',license});if(!r?.ok)throw new Error(r?.error||'保存失败');$('status').textContent=license?'许可已保存，已解锁不限次数。':'已清除许可。';await refresh();}catch(e){$('status').textContent=e.message;}}
$('license-form').addEventListener('submit',e=>{e.preventDefault();save($('license').value.trim());});$('clear').addEventListener('click',()=>{$('license').value='';save('');});
refresh().catch(e=>{$('status').textContent=e.message;});
