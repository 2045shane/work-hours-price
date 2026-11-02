const {test}=require('node:test');
const a=require('node:assert/strict');
const p=require('../src/lib/price');
const c=require('../src/lib/cooldown');
const q=require('../src/lib/quota');
const l=require('../src/lib/license');
for(const [text,amount,currency] of [['$1,299.99',1299.99,'USD'],['US$ 25',25,'USD'],['€12,50',12.5,'EUR'],['€1.299,99',1299.99,'EUR'],['£1,200',1200,'GBP'],['¥100',100,'CNY'],['￥30',30,'CNY'],['CNY 1 299,50',1299.5,'CNY'],['$20–$40',20,'USD'],['$40 - $20',20,'USD'],['12.50 USD',12.5,'USD']])test('解析 '+text,()=>a.deepEqual(p.parsePrice(text),{amount,currency}));
test('无效价格和无币种兜底',()=>{a.equal(p.parsePrice('暂无价格'),null);a.deepEqual(p.parsePrice('19.99','USD'),{amount:19.99,currency:'USD'});});
test('换算与中文格式',()=>{a.equal(p.toHours(100,25),4);a.equal(p.formatHours(4,8),'约 4 小时（0.5 个工作日，按每天 8 小时）');a.throws(()=>p.toHours(1,0));a.throws(()=>p.toHours(-1,25));});
test('冷静期按 URL 开始、保留和结束',()=>{let map={};map=c.startCooldown(map,'https://x/p#one',60,1000);a.equal(c.remainingMs(map,'https://x/p#two',1000),3600000);a.deepEqual(c.startCooldown(map,'https://x/p',60,2000),map);a.equal(c.remainingMs(map,'https://x/p',3601000),0);a.equal(c.remainingMs(c.finishCooldown(map,'https://x/p'),'https://x/p',1000),0);a.equal(c.formatRemaining(61000),'1 分 1 秒');a.equal(c.formatRemaining(0),'冷静期已结束');});
test('配额跨日及超限',()=>{const now=new Date(2026,10,1,12);a.equal(q.readQuota({date:'2026-11-01',count:3},now).allowed,false);a.equal(q.readQuota({date:'2026-10-31',count:3},now).remaining,3);a.equal(q.readQuota({date:'2026-11-01',count:3},now,true).allowed,true);});
test('并发扣减不会超过三次',async()=>{const data={};const storage={get:async()=>({...data}),set:async v=>Object.assign(data,v)};const store=q.createQuotaStore(storage);const results=await Promise.all(Array.from({length:5},()=>store.consume()));a.equal(results.filter(x=>x.recorded).length,3);});
test('license 正确与错误',async()=>{const token=await l.issueLicense();a.match(token,/^WHP1\.[a-f0-9]{64}$/);a.equal(await l.verifyLicense(token),true);a.equal(await l.verifyLicense('WHP1.'+'0'.repeat(64)),false);a.equal(await l.verifyLicense('bad'),false);});
test('设置默认值、CNY 时薪及无效输入回退',()=>{const s=require('../src/lib/settings');a.deepEqual(s.normalizeSettings(),s.DEFAULTS);a.equal(s.normalizeSettings({currency:'CNY'}).hourlyWage,30);a.equal(s.normalizeSettings({hourlyWage:-2,dailyHours:0,cooldownMinutes:NaN}).cooldownMinutes,1440);});
test('许可摘要独立核对公开种子',async()=>{a.equal(await l.issueLicense(),'WHP1.'+require('node:crypto').createHash('sha256').update('work-hours-price:unlock:v1').digest('hex'));});
test('冷静期刷新不重启，缺失 URL 和确认操作幂等',()=>{const url='https://x/p?a=1';const records=c.startCooldown({},url,1,0);a.equal(c.remainingMs(records,url,30000),30000);a.equal(c.remainingMs(records,'https://x/p?a=2',30000),0);const finished=c.finishCooldown(records,url);a.deepEqual(c.finishCooldown(finished,url),finished);a.deepEqual(c.startCooldown(finished,url,1,90000),finished);a.throws(()=>c.startCooldown({},url,0));});

// 真站回归（2026-11-02 抓取 amazon.com/dp/B077ZKF9ZN 与 /dp/B0018OKX68 的结构精简版）
test('Amazon 取本商品到手价，不取每件单价或其他商品卡片价',()=>{
 const {JSDOM}=require('jsdom');
 const s=require('../src/content/selectors'),p=require('../src/lib/price');
 const gildan=new JSDOM(`<div id="corePriceDisplay_desktop_feature_div"><span class="a-price priceToPay apex-pricetopay-value"><span class="a-offscreen"></span><span aria-hidden="true">$20.49</span></span><span class="pricePerUnit"><span class="a-price a-text-price apex-priceperunit-value"><span class="a-offscreen">$4.10</span></span></span></div><div id="corePrice_feature_div"><span class="a-price apex-pricetopay-value"><span class="a-offscreen">$20.49</span></span><span class="a-price a-text-price apex-priceperunit-value"><span class="a-offscreen">$4.10</span></span></div>`).window.document;
 const r=s.findPrice(gildan,'https://www.amazon.com/dp/B077ZKF9ZN',p.parsePrice);require('node:assert/strict').equal(r.price.amount,20.49);
 const levis=new JSDOM(`<div id="CardInstanceX"><span class="a-price"><span class="a-offscreen">$31.84</span></span></div>`).window.document;
 require('node:assert/strict').equal(s.findPrice(levis,'https://www.amazon.com/dp/B0018OKX68',p.parsePrice),null);
});
test('amazon.co.jp 的 ￥ 识别为日元',()=>{require('node:assert/strict').equal(require('../src/lib/price').parsePrice('￥3,980','JPY').currency,'JPY');});
