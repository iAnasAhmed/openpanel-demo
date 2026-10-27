import { defineConfig, loadEnv, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import { getAnalytics } from './server/analytics';

// Serves /api/analytics from the dev and preview servers.
function analyticsApi(mode: string) {
  const env = loadEnv(mode, process.cwd(), 'OPENPANEL_');
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url !== '/api/analytics') return next();
    const send = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader('content-type', 'application/json');
      res.setHeader('cache-control', 'no-store');
      res.end(JSON.stringify(body));
    };
    if (!env.OPENPANEL_READ_CLIENT_ID || !env.OPENPANEL_READ_CLIENT_SECRET || !env.OPENPANEL_PROJECT_ID) return send(503, { error: 'analytics not configured' });
    getAnalytics({
      apiUrl: env.OPENPANEL_API_URL || 'http://127.0.0.1:3333',
      projectId: env.OPENPANEL_PROJECT_ID,
      clientId: env.OPENPANEL_READ_CLIENT_ID,
      clientSecret: env.OPENPANEL_READ_CLIENT_SECRET,
    }).then(data => send(200, data), () => send(502, { error: 'analytics unavailable' }));
  };
  return {
    name: 'demo-analytics-api',
    configureServer: (server: { middlewares: Connect.Server }) => { server.middlewares.use(handler); },
    configurePreviewServer: (server: { middlewares: Connect.Server }) => { server.middlewares.use(handler); },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), analyticsApi(mode)],
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 5180, strictPort: true },
}));
