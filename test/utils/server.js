const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const User = require('./user');
const auth = require('../../lib').auth;

const app = new Koa();
app.keys = ['asdfasdfasdfasdf'];
app.use(bodyParser());
app.use(session({}, app));

const router = new Router();
router.post('/login', auth.login(User, {
  usernameField: 'email',
  passwordField: 'password'
}));
router.use(async (ctx, next) => {
    if (!ctx.session.userId) {
        ctx.throw(401);
    }

    await next();
});
router.get('/protected', (ctx) => {
  ctx.response.body = 'Authenticated route';
});

app.use(router.routes());
app.use(router.allowedMethods());

mongoose.connect(
  'mongodb://127.0.0.1:27017/koa-mongoose-session-auth',
  { useNewUrlParser: true },
);

const server = app.listen(3002);
server.on('close', async () => {
  await mongoose.disconnect();
});

module.exports = server;
