module.exports = {
    apps: [{
      name: 'pubgm-nextjs-app',
      script: 'npm',
      args: 'start',
      cwd: '/root/home/app-home-hub', // 你的项目路径
      instances: 'max', // 使用所有CPU核心
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }]
  }