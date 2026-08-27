// 生产使用直接启动 Next，避免包管理器在服务启动阶段触发依赖安装。
const appRoot = process.env.APKS_SITES_PATH || '/root/home/apks-sites';

module.exports = {
  apps: [
    {
      name: 'pubgm-app',
      cwd: appRoot,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      time: true,
    },
  ],
};
