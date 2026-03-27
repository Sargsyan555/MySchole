/**
 * PM2 — run from the `client` directory (same folder as this file):
 *
 *   npm run build
 *   pm2 start ecosystem.config.cjs
 *
 * Optional: set a strong admin password on the server:
 *   ADMIN_PASSWORD='your-secret' pm2 start ecosystem.config.cjs --update-env
 *
 * Logs: pm2 logs school
 * Status: pm2 status
 * Restart after deploy: pm2 reload school
 */
module.exports = {
  apps: [
    {
      name: 'school',
      script: './server/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
      },
    },
  ],
};
