module.exports = {
  apps: [
    {
      name: 'saviglobalserver',
      script: './dist/index.js', // Đường dẫn chính xác tới file build
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
