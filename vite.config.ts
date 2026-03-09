import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Mock API Plugin for local development
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      // Mock session endpoint
      if (req.url === '/api/session' && req.method === 'GET') {
        // Just return a dummy session or parse a cookie if we wanted full mock auth.
        // For simplicity, we just say not active and let them login.
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ user: null }));
        return;
      }

      if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: string) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);

            // Parse .env.local to validate
            const envPath = path.resolve('.env.local');
            let envConfig: any = {};
            if (fs.existsSync(envPath)) {
              envConfig = dotenv.parse(fs.readFileSync(envPath));
            }

            let foundUser = null;
            // Iterate over existing users
            for (const key of Object.keys(envConfig)) {
              if (key.startsWith('USER_')) {
                const parts = envConfig[key].split('|');
                if (parts.length >= 3) {
                  const firmaAdi = parts[0].trim();
                  const sifre = parts[1].trim();
                  if (firmaAdi === data.firmaAdi?.trim() && sifre === data.sifre?.trim()) {
                    foundUser = {
                      id: key,
                      firmaAdi: firmaAdi,
                      adaParsel: key.replace('USER_', '').replace('_', '-'), // Format for UI
                      projeAdi: parts[2].trim()
                    };
                    break;
                  }
                }
              }
            }

            res.setHeader('Content-Type', 'application/json');
            if (foundUser) {
              // Return actual user mapped from Admin Panel
              res.end(JSON.stringify({
                success: true,
                user: foundUser
              }));
            } else {
              res.end(JSON.stringify({
                success: false,
                message: 'Firma adı veya şifre hatalı. Kayıt bulunamadı.'
              }));
            }
          } catch (e) {
            res.statusCode = 400;
            res.end('Bad Request');
          }
        });
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
})
