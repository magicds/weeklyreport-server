const Koa = require('koa');
const cors = require('koa2-cors');
const bodyParser = require('koa-body');

const config = require('./config');
const router = require('./app/router/');

const db = require('./app/utils/db');
const connent = db.connect();

const app = new Koa();
app.use(bodyParser());
app.use(
    cors({
        credentials: true
    })
);
app.use(require('./app/middleware/handleError'));
app.use(router.routes(), router.allowedMethods());

// listen at prot
app.listen(config.port);
console.log(`app started at ${config.port}`);
