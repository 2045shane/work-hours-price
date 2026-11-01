(function(root){
'use strict';
// DOM 易变、未真站验收。按主价格优先排序；候选可能随地区、实验和页面类型失效。
const SELECTORS={
 amazon:['.a-price .a-offscreen','#corePrice_feature_div .a-offscreen','#priceblock_ourprice','#priceblock_dealprice','#price_inside_buybox','#corePrice_feature_div'],
 ebay:['.x-price-primary .ux-textspans','#prcIsum','[itemprop="price"]'],
 target:['[data-test="product-price"]','[data-test="product-price"] span'],
 walmart:['[itemprop="price"]','[data-testid="price-wrap"]','[data-automation-id="product-price"]'],
 bestbuy:['.priceView-customer-price span[aria-hidden="true"]','.priceView-hero-price span','.priceView-customer-price'],
 generic:['[itemprop="price"]','meta[property="product:price:amount"]','meta[property="og:price:amount"]']
};
function getSite(url){try{const h=new URL(url).hostname;if(/^www\.amazon\.(com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|in|com\.br|com\.mx)$/.test(h))return 'amazon';return ({'www.ebay.com':'ebay','www.ebay.co.uk':'ebay','www.target.com':'target','www.walmart.com':'walmart','www.bestbuy.com':'bestbuy'})[h]||null;}catch{return null;}}
function findPrice(doc,url,parsePrice){const site=getSite(url);if(!site)return null;const currency=doc.querySelector('[itemprop="priceCurrency"],meta[property="product:price:currency"],meta[property="og:price:currency"]')?.getAttribute('content')||(/amazon\.co\.uk|ebay\.co\.uk/.test(url)?'GBP':/amazon\.(de|fr|it|es)\//.test(url)?'EUR':/amazon\.co\.jp/.test(url)?'JPY':'USD');
 for(const selector of [...SELECTORS[site],...SELECTORS.generic])for(const el of doc.querySelectorAll(selector)){const price=parsePrice(el.getAttribute('content')||el.textContent,currency);if(price)return {element:el,price};}return null;}
const api={SELECTORS,getSite,findPrice};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
