module.exports = {
  apps: [
    {
      name: "ktx_frontend",
      script: "server.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      time: true,
      env: {
        NODE_ENV: "production",
        // Mặc định chỉ nghe nội bộ (sau reverse proxy). Muốn truy cập thẳng bằng IP trong LAN thì đặt
        // HOSTNAME=0.0.0.0 trong shared/production.env (kèm NEXTAUTH_URL=http://<IP>:3000).
        HOSTNAME: process.env.HOSTNAME_LISTEN || "127.0.0.1",
        PORT: process.env.PORT || "3000",
      },
    },
  ],
};
