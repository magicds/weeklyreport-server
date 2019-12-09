module.exports = {
  port: process.env.APP_PORT || "2222",
  db: {
    servername: "192.168.201.159",
    database: "fe_manage",
    port: 27017,
    user: "",
    pass: "",
    authSource: ""
  },

  // smtp  配置
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "",
  SMTP_SECURE: process.env.SMTP_SECURE || "",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PWD: process.env.SMTP_PWD || "",

  COOKIE_TOKEN_KEY: "epoint_fe_token",
  COOKIE_UID_KEY: "epoint_fe_uid"
};
