const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const visited = new Set();
const errors = [];

async function crawl(urlPath) {
  if (visited.has(urlPath)) return;
  visited.add(urlPath);

  try {
    const res = await fetchUrl(`http://localhost:5173${urlPath}`);
    if (res.status >= 400) {
      console.error(`[HTTP ${res.status}] Failed to load ${urlPath}`);
      errors.push({ url: urlPath, status: res.status, body: res.body.slice(0, 300) });
      return;
    }

    // Extract imported modules
    // import ... from "/src/..." or from "/@fs/..." or "/node_modules/..."
    const importRegex = /(?:import|export)\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g;
    let match;
    const imports = [];
    while ((match = importRegex.exec(res.body)) !== null) {
      const target = match[1];
      if (target.startsWith('/') && !target.startsWith('/@') && !target.includes('node_modules')) {
        imports.push(target);
      }
    }

    for (const imp of imports) {
      await crawl(imp);
    }
  } catch (err) {
    errors.push({ url: urlPath, error: err.message });
  }
}

async function run() {
  console.log('Crawling Vite modules starting from /src/main.jsx...');
  await crawl('/src/main.jsx');
  console.log(`Crawled ${visited.size} internal modules.`);
  if (errors.length > 0) {
    console.error('Errors found during module crawl:', JSON.stringify(errors, null, 2));
  } else {
    console.log('All modules loaded with HTTP 200 without transform errors.');
  }
}

run();
