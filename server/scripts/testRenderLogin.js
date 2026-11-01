const path = require('path');
const fs = require('fs');

async function testAllRoutes() {
  const esbuild = require('../../client/node_modules/esbuild');

  console.log('Bundling App.jsx with esbuild for node test...');
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../../client/src/App.jsx')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx', '.css': 'empty' },
    external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', 'axios', 'framer-motion', 'lucide-react', 'react-icons'],
  });

  const code = result.outputFiles[0].text;
  const tempFile = path.resolve(__dirname, '../scratch_app_bundle.cjs');
  fs.writeFileSync(tempFile, code);

  const clientNodeModules = path.resolve(__dirname, '../../client/node_modules');
  require('module').globalPaths.push(clientNodeModules);
  process.env.NODE_PATH = clientNodeModules;
  require('module').Module._initPaths();

  const React = require('../../client/node_modules/react');
  const ReactDOMServer = require('../../client/node_modules/react-dom/server');

  const testCases = [
    { name: 'Login (unauthenticated)', pathname: '/login', user: null, token: null },
    { name: 'Self Dashboard (authenticated)', pathname: '/dashboard/self', user: { id: 'u1', name: 'Test User', role: 'self_user' }, token: 'tok_1' },
    { name: 'Clinician Dashboard (authenticated)', pathname: '/dashboard/clinician', user: { id: 'c1', name: 'Dr. Test', role: 'clinician', settings: { reportRangeDays: 90 } }, token: 'tok_2' },
  ];

  for (const tc of testCases) {
    console.log(`\n--- Testing ${tc.name} at ${tc.pathname} ---`);
    global.localStorage = {
      getItem: (k) => {
        if (k === 'cest_user') return tc.user ? JSON.stringify(tc.user) : null;
        if (k === 'cest_token') return tc.token;
        return null;
      },
      setItem: () => {},
      removeItem: () => {},
    };
    global.window = {
      location: { origin: 'http://localhost:5173', href: `http://localhost:5173${tc.pathname}`, pathname: tc.pathname, search: '', hash: '' },
      history: { pushState: () => {}, replaceState: () => {}, state: null },
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    global.document = {
      defaultView: global.window,
      documentElement: { classList: { add: () => {}, remove: () => {} } },
      visibilityState: 'visible',
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    delete require.cache[require.resolve(tempFile)];
    const App = require(tempFile).default || require(tempFile);

    try {
      const html = ReactDOMServer.renderToString(React.createElement(App));
      console.log(`[PASS] ${tc.name} rendered cleanly! Length: ${html.length}`);
    } catch (err) {
      console.error(`[CRASH] ${tc.name} threw error:`, err);
    }
  }

  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
}

testAllRoutes().catch((err) => {
  console.error('[FATAL]:', err);
});
