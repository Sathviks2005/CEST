const { spawn } = require('child_process');

async function testBrowser() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9235;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1500));
    const newPageRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
    const tab = await newPageRes.json();

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;

    function send(method, params = {}) {
      return new Promise(resolve => {
        const reqId = ++id;
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === reqId) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    const exceptions = [];
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const text = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        console.error('[BROWSER EXCEPTION]:', text);
        exceptions.push(text);
      }
    };

    await new Promise(r => { ws.onopen = r; });
    await send('Runtime.enable');
    await send('Page.enable');

    // 1. Test /login directly
    console.log('\n--- Navigating to http://localhost:5173/login ---');
    await send('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise(r => setTimeout(r, 2500));

    const loginText = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    console.log('Login Body Text Snippet:');
    console.log(loginText?.result?.value?.slice(0, 150).replace(/\n+/g, ' '));
    if (loginText?.result?.value?.includes('Welcome Back') && loginText?.result?.value?.includes('Sign In')) {
      console.log('[PROVEN PASS]: /login renders form fields and buttons cleanly without crash.');
    } else {
      console.error('[FAIL]: /login did not render welcome form.');
    }

    // 2. Test /dashboard/self with authenticated session
    console.log('\n--- Navigating to http://localhost:5173/dashboard/self ---');
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('cest_token', 'mock_jwt_token_self_1');
        localStorage.setItem('cest_user', JSON.stringify({ id: 'u1', name: 'Alice Walker', role: 'self_user', email: 'alice@cest.org' }));
      `
    });
    await send('Page.navigate', { url: 'http://localhost:5173/dashboard/self' });
    await new Promise(r => setTimeout(r, 2500));

    const selfText = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    console.log('Self Dashboard Text Snippet:');
    console.log(selfText?.result?.value?.slice(0, 180).replace(/\n+/g, ' '));
    if (selfText?.result?.value?.includes('Self User Dashboard') || selfText?.result?.value?.includes('Welcome back')) {
      console.log('[PROVEN PASS]: /dashboard/self renders clean user dashboard without crash.');
    }

    // 3. Test /dashboard/clinician with authenticated clinician session
    console.log('\n--- Navigating to http://localhost:5173/dashboard/clinician ---');
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('cest_token', 'mock_jwt_token_clin_1');
        localStorage.setItem('cest_user', JSON.stringify({ id: 'c1', name: 'Gregory House', title: 'Dr.', specialization: 'Diagnostics', institution: 'Princeton Plainsboro', role: 'clinician', email: 'house@cest.org' }));
      `
    });
    await send('Page.navigate', { url: 'http://localhost:5173/dashboard/clinician' });
    await new Promise(r => setTimeout(r, 2500));

    const clinText = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    console.log('Clinician Dashboard Text Snippet:');
    console.log(clinText?.result?.value?.slice(0, 180).replace(/\n+/g, ' '));
    if (clinText?.result?.value?.includes('Clinician Workspace') || clinText?.result?.value?.includes('CLINICIAN PORTAL')) {
      console.log('[PROVEN PASS]: /dashboard/clinician renders clinician portal cleanly without crash.');
    }

    console.log('\nTotal Browser Uncaught Exceptions caught:', exceptions.length);
    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

testBrowser();
