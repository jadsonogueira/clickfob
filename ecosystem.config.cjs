module.exports = {
  apps: [
    {
      name: "clickfob",
      cwd: "C:\\apps\\clickfob",
      script: "pm2-start.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3000",

        // ? Resend
        RESEND_API_KEY: "re_USAZwyKC_BSsnY31NM81ug9xTe61aVDwV",
        RESEND_FROM: "Igreja de Deus <no-reply@synkra.ca>",
      },
    },
  ],
};
