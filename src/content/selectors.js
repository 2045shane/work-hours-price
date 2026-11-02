(function(root){
'use strict';
// DOM 易变、未真站验收。按主价格优先排序；候选可能随地区、实验和页面类型失效。
const SELECTORS={
 // 2026-11-02 真站 HTML 回归：裸 '.a-price .a-offscreen' 会命中「每件单价」(pricePerUnit) 或页面上方其他商品卡片的价格，
 // 所以只在本商品价格块内取 priceToPay，并在 findPrice 里排除单价/划线价/推荐卡片。
 amazon:['#corePrice_feature_div .apex-pricetopay-value .a-offscreen','#corePriceDisplay_desktop_feature_div .apex-pricetopay-value .a-offscreen','#tp_price_block_total_price_ww .a-offscreen','#corePriceDisplay_desktop_feature_div .priceToPay','#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen','#corePrice_desktop .a-price:not(.a-text-price) .a-offscreen','#priceblock_ourprice','#priceblock_dealprice','#price_inside_buybox'],
 ebay:['.x-price-primary .ux-textspans','#prcIsum','[itemprop="price"]'],
 target:['[data-test="product-price"]','[data-test="product-price"] span'],
 walmart:['[itemprop="price"]','[data-testid="price-wrap"]','[data-automation-id="product-price"]'],
 bestbuy:['.priceView-customer-price span[aria-hidden="true"]','.priceView-hero-price span','.priceView-customer-price'],
 generic:['[itemprop="price"]','meta[property="product:price:amount"]','meta[property="og:price:amount"]']
};
function getSite(url){try{const h=new URL(url).hostname;if(/^www\.amazon\.(com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|in|com\.br|com\.mx)$/.test(h))return 'amazon';return ({'www.ebay.com':'ebay','www.ebay.co.uk':'ebay','www.target.com':'target','www.walmart.com':'walmart','www.bestbuy.com':'bestbuy'})[h]||null;}catch{return null;}}
function findPrice(doc,url,parsePrice){const site=getSite(url);if(!site)return null;const currency=doc.querySelector('[itemprop="priceCurrency"],meta[property="product:price:currency"],meta[property="og:price:currency"]')?.getAttribute('content')||(/amazon\.co\.uk|ebay\.co\.uk/.test(url)?'GBP':/amazon\.(de|fr|it|es)\//.test(url)?'EUR':/amazon\.co\.jp/.test(url)?'JPY':'USD');
 for(const selector of [...SELECTORS[site],...SELECTORS.generic])for(const el of doc.querySelectorAll(selector)){if(el.closest('.pricePerUnit,.apex-priceperunit-value,.basisPrice,.apex-basisprice-value,[id^="CardInstance"],[data-a-strike="true"]'))continue;const price=parsePrice(el.getAttribute('content')||el.textContent,currency);if(price)return {element:el,price};}return null;}
const api={SELECTORS,getSite,findPrice};Object.assign(root.WorkHoursPrice ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
