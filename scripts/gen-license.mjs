import { createHash } from 'node:crypto';
// 公开种子，仅用于离线 MVP 校验，不是安全授权。
console.log('WHP1.' + createHash('sha256').update('work-hours-price:unlock:v1').digest('hex'));
