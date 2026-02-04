// Vercel Serverless Function: 币安代理 (强制纯文本版)
const https = require('https');

module.exports = (req, res) => {
  const hostname = 'p2p.binance.com';
  const path = '/bapi/c2c/v2/friendly/c2c/adv/search';

  // 1. 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Clienttype');
    res.status(200).end();
    return;
  }

  // 2. 只允许 POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // 3. 构造请求参数
  const options = {
    hostname: hostname,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 🟢 关键修改：明确告诉币安不要压缩，给我纯文本！
      'Accept-Encoding': 'identity',
      
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Clienttype': 'web',
      'Host': hostname,
      'Origin': `https://${hostname}`,
      'Referer': `https://${hostname}/en/trade/all-payments/USDT?fiat=CNY`
    }
  };

  // 4. 发起转发请求
  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.status(proxyRes.statusCode).send(data);
    });
  });

  proxyReq.on('error', (e) => {
    console.error(e);
    res.status(500).json({ error: e.message });
  });

  if (req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
};
