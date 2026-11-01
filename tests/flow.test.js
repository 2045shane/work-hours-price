const {test}=require('node:test');const a=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const root=path.resolve(__dirname,'..');
function background(){
 const data={},listeners=[];const storage={get:async keys=>Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,data[k]])),set:async patch=>Object.assign(data,patch)};
 const context=vm.createContext({URL,TextEncoder,crypto:require('node:crypto').webcrypto,chrome:{storage:{local:storage},runtime:{getURL:p=>'chrome-extension://test/'+p,onMessage:{addListener:f=>listeners.push(f)}}}});
 context.importScripts=(...files)=>{for(const file of files)vm.runInContext(fs.readFileSync(path.resolve(root,'src/background',file),'utf8'),context);};
 vm.runInContext(fs.readFileSync(path.join(root,'src/background/service-worker.js'),'utf8'),context);
 const send=(message,sender={tab:{id:1},url:'https://www.amazon.com/dp/test'})=>new Promise(resolve=>{listeners[0](message,sender,resolve);});return {send,data,storage};
}
test('后台拒绝错误来源、串行扣减三次并显示超限文案',async()=>{const b=background();a.equal((await b.send({type:'WHP_CONSUME'},{url:'chrome-extension://test/src/popup/popup.html'})).ok,false);const r=await Promise.all(Array.from({length:4},()=>b.send({type:'WHP_CONSUME'})));a.equal(r.filter(x=>x.ok).length,3);a.equal(r[3].error,'免费次数已用完，解锁请小红书私信「珊哥爱读书」');});
test('后台许可仅设置页保存，解锁后不扣免费次数',async()=>{const b=background(),license=await require('../src/lib/license').issueLicense();a.equal((await b.send({type:'WHP_SAVE_LICENSE',license})).ok,false);a.equal((await b.send({type:'WHP_SAVE_LICENSE',license},{url:'chrome-extension://test/src/options/options.html'})).ok,true);for(let i=0;i<4;i++)a.equal((await b.send({type:'WHP_CONSUME'})).ok,true);a.equal(b.data.whpQuota,undefined);});
test('后台冷静期记录跨调用保留，确认结束且不消耗次数',async()=>{const b=background();b.data.whpSettings={cooldownEnabled:true,cooldownMinutes:1};const first=await b.send({type:'WHP_COOLDOWN'}),second=await b.send({type:'WHP_COOLDOWN'});a.equal(JSON.stringify(first.records),JSON.stringify(second.records));const done=await b.send({type:'WHP_ACK'});a.equal(done.records['https://www.amazon.com/dp/test'].acknowledged,true);a.equal(b.data.whpQuota,undefined);});
// 本地最小 DOM fixture 只替代浏览器接口；运行真实 content / background / lib 代码。
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.events={};this.textContent='';}
 append(...children){this.children.push(...children);}
 attachShadow(){this.shadow=new Element('shadow');return this.shadow;}
 setAttribute(k,v){this.attrs[k]=v;}
 getAttribute(k){return this.attrs[k]??null;}
 addEventListener(k,f){this.events[k]=f;}
 matches(s){return s==='meta'&&this.tag==='meta';}
 closest(){return null;}
 insertAdjacentElement(position,element){this.inserted=element;}
 remove(){this.removed=true;}
}
function content(b){
 let handler;const price=new Element('span');price.textContent='$100';const document={documentElement:new Element('html'),body:new Element('body'),createElement:t=>new Element(t),querySelector:()=>null,querySelectorAll:s=>s==='.a-price .a-offscreen'?[price]:[]};
 const context=vm.createContext({URL,document,location:{href:'https://www.amazon.com/dp/test'},setInterval:()=>1,clearInterval:()=>{},chrome:{storage:{local:b.storage},runtime:{sendMessage:m=>b.send(m),onMessage:{addListener:f=>handler=f}}}});
 for(const file of ['lib/price.js','lib/settings.js','lib/cooldown.js','content/selectors.js','content/content.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',file),'utf8'),context);
 return {price,document,scan:()=>new Promise(resolve=>handler({type:'WHP_SCAN'},{},resolve))};
}
test('popup 消息触发真实页面扫描，一次配额且标注四小时工作',async()=>{const b=background(),c=content(b);a.equal(b.data.whpQuota,undefined);a.equal((await c.scan()).ok,true);a.equal(b.data.whpQuota.count,1);const section=c.price.inserted.shadow.children[1];a.equal(section.children[0].textContent,'≈ 4 小时工作');a.equal(section.children[1].textContent,'约 4 小时（0.5 个工作日，按每天 8 小时）');await c.scan();a.equal(b.data.whpQuota.count,2);});
test('币种不同提示不换汇；浮动按钮可触发扫描',async()=>{const b=background();b.data.whpSettings={currency:'CNY',hourlyWage:30};const c=content(b);const r=await c.scan();a.equal(r.ok,false);a.match(r.error,/不做汇率换算/);const floating=c.document.documentElement.children[0],button=floating.shadow.children[1].children[0];await button.events.click();a.equal(b.data.whpQuota.count,2);});
test('冷静期在主价格下显示，点击我已冷静不再消耗配额',async()=>{const b=background();b.data.whpSettings={cooldownEnabled:true,cooldownMinutes:1440};const c=content(b);await c.scan();const section=c.price.inserted.shadow.children[1];a.match(section.children[2].textContent,/冲动消费冷静期：还剩/);a.equal(section.children[3].textContent,'我已冷静');await section.children[3].events.click();a.match(section.children[2].textContent,/冷静期已结束/);a.equal(b.data.whpQuota.count,1);});
