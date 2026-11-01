const { spawn } = require('child_process');

async function checkLoginFields() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9245;
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/login'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const newPageRes = await fetch('http://127.0.0.1:' + port + '/json');
    const tabs = await newPageRes.json();
    const tab = tabs.find(t => t.url.includes('login'));

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));

    const query = `
      JSON.stringify({
        hasRoot: !!document.getElementById('root'),
        title: document.title,
        heading: document.querySelector('h1')?.textContent,
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, type: i.type, placeholder: i.placeholder })),
        submitBtn: document.querySelector('button[type="submit"]')?.textContent?.trim()
      })
    `;

    ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: query } }));
    const result = await new Promise(resolve => {
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === 2) { ws.removeEventListener('message', h); resolve(d.result?.result?.value); }
      });
    });
    console.log('Login DOM Inspection:', JSON.parse(result));
    ws.close();
  } finally {
    chrome.kill();
  }
}

checkLoginFields();
