const { spawn } = require('child_process');

async function testScenario(name, setupScript, url) {
  console.log(`\n========================================`);
  console.log(`SCENARIO: ${name} -> ${url}`);
  console.log(`========================================`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9225;
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
    const logs = [];

    await new Promise((resolve) => {
      ws.onopen = async () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));

        // Navigate to domain first to access localStorage
        await send('Page.navigate', { url: 'http://localhost:5173/' });
        await new Promise(r => setTimeout(r, 1000));

        if (setupScript) {
          await send('Runtime.evaluate', { expression: setupScript });
        }

        // Navigate to target url
        await send('Page.navigate', { url });
        setTimeout(resolve, 4000);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[EXCEPTION]:', JSON.stringify(msg.params.exceptionDetails, null, 2));
          exceptions.push(msg.params.exceptionDetails);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          if (msg.params.type === 'error') {
            console.error(`[CONSOLE ERROR]:`, text);
          } else {
            logs.push(`[${msg.params.type}] ${text}`);
          }
        }
      };
    });

    const bodyRes = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    console.log('Result innerText snippet:', (bodyRes?.result?.value || '').slice(0, 300).replace(/\n+/g, ' '));
    console.log('Exceptions caught:', exceptions.length);

    ws.close();
  } catch (err) {
    console.error('Error in scenario:', err);
  } finally {
    chrome.kill();
  }
}

async function main() {
  // Scenario 1: Self-user navigating to /login
  await testScenario(
    'Self user with mock token at /login',
    `localStorage.setItem('cest_token', 'mock_jwt_token_123'); localStorage.setItem('cest_user', JSON.stringify({ id: 'u1', name: 'John Doe', role: 'self_user', email: 'john@example.com' }));`,
    'http://localhost:5173/login'
  );

  // Scenario 2: Self-user navigating to /dashboard/self
  await testScenario(
    'Self user with mock token at /dashboard/self',
    `localStorage.setItem('cest_token', 'mock_jwt_token_123'); localStorage.setItem('cest_user', JSON.stringify({ id: 'u1', name: 'John Doe', role: 'self_user', email: 'john@example.com' }));`,
    'http://localhost:5173/dashboard/self'
  );

  // Scenario 3: Clinician navigating to /dashboard/clinician
  await testScenario(
    'Clinician with mock token at /dashboard/clinician',
    `localStorage.setItem('cest_token', 'mock_jwt_token_456'); localStorage.setItem('cest_user', JSON.stringify({ id: 'c1', name: 'Dr. House', role: 'clinician', email: 'house@hospital.org' }));`,
    'http://localhost:5173/dashboard/clinician'
  );

  // Scenario 4: Real login with real server user (if server has one or test invalid/corrupt user)
  await testScenario(
    'Corrupt/null user object in localStorage at /login',
    `localStorage.setItem('cest_token', 'null'); localStorage.setItem('cest_user', 'undefined');`,
    'http://localhost:5173/login'
  );
}

main();
