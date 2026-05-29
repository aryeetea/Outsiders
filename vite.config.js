import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function localApiPlugin() {
  return {
    name: 'outsiders-local-api',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });
        req.on('end', async () => {
          try {
            const { default: handler } = await import('./api/send-email.js');
            const body = rawBody ? JSON.parse(rawBody) : {};
            const apiReq = { method: req.method, body };
            const apiRes = {
              statusCode: 200,
              status(code) {
                this.statusCode = code;
                return this;
              },
              json(payload) {
                res.statusCode = this.statusCode;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(payload));
              },
            };

            await handler(apiReq, apiRes);
          } catch (error) {
            server.config.logger.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error?.message || 'Email API failed' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(),
    ],
  };
}) 
