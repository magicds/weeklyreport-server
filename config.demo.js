module.exports = {
    port: process.env.APP_PORT || '2222',
    db: {
        servername: '192.168.201.159',
        database: 'fe_manage',
        port: 27017,
        user: "",
        pass: "",
        authSource: ""
    },

    COOKIE_TOKEN_KEY: 'epoint_fe_token',
    COOKIE_UID_KEY: 'epoint_fe_uid'
}