(function(root){
'use strict';
function quotaText(q){return q.unlocked?'已解锁 · 不限次数':`今日免费剩余 ${q.remaining} / 3 次`;}
Object.assign(root.WorkHoursPrice ||= {},{quotaText});if(typeof module!=='undefined'&&module.exports)module.exports={quotaText};
})(globalThis);
