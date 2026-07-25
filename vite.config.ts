import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

import healthHandler from './api/health';
import settingsHandler from './api/settings';
import noticesHandler from './api/notices';
import faqsHandler from './api/faqs';
import reviewsHandler from './api/reviews';
import ordersIndexHandler from './api/orders/index';
import ordersIdentifierHandler from './api/orders/[identifier]';
import exportCsvHandler from './api/export/csv';

function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = urlObj.pathname;

        // Parse JSON body for POST/PATCH
        let body: any = {};
        if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
          const buffers: Uint8Array[] = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          if (raw) {
            try { body = JSON.parse(raw); } catch {}
          }
        }

        // Standardize query params
        const query: Record<string, any> = {};
        urlObj.searchParams.forEach((value, key) => {
          query[key] = value;
        });

        // Mock Vercel req / res helpers
        const vercelReq: any = req;
        vercelReq.query = query;
        vercelReq.body = body;

        const vercelRes: any = res;
        vercelRes.status = (code: number) => {
          res.statusCode = code;
          return vercelRes;
        };
        vercelRes.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
          return vercelRes;
        };
        vercelRes.send = (data: any) => {
          res.end(data);
          return vercelRes;
        };

        try {
          if (pathname === '/api/health') {
            return await healthHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/settings') {
            return await settingsHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/notices') {
            return await noticesHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/faqs') {
            return await faqsHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/reviews') {
            return await reviewsHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/orders' || pathname === '/api/orders/') {
            return await ordersIndexHandler(vercelReq, vercelRes);
          }
          if (pathname === '/api/export/csv') {
            return await exportCsvHandler(vercelReq, vercelRes);
          }
          if (pathname.startsWith('/api/orders/')) {
            const parts = pathname.split('/');
            const identifier = parts[parts.length - 1];
            vercelReq.query.identifier = identifier;
            return await ordersIdentifierHandler(vercelReq, vercelRes);
          }
        } catch (err) {
          console.error('Vite API Dev Middleware Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
