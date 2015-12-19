import express from 'express';
import config from 'config';
import redisStore from 'connect-redis';
import bodyParser from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import sassMiddleware from 'node-sass-middleware';

const app = express();
const development = config.get('nodeEnv') === 'development';
app.set('port', config.get('port'));

// Set up Redis for session storage;
const Store = redisStore(session);
const storeOptions = {
    host: config.has('redisIP') ? config.get('redisIP') : undefined,
    port: config.has('redisPort') ? config.get('redisPort') : undefined,
};

const useRedis = storeOptions.host && storeOptions.port;
if (useRedis) console.log('Using redis for session storage');

app.use(session({
    store: useRedis ? new Store(storeOptions) : undefined,
    secret: config.get('sessionSecret'),
    saveUninitialized: true,
    resave: true,
}));

app.use(compression());

app.use(sassMiddleware({
    src: 'src/scss/',
    dest: 'build/css',
    debug: development,
    outputStyle: 'compressed',
    prefix: '/css/',
}));

app.set('views', 'server/views');
app.use(express.static('build'));
app.set('view engine', 'jade');
app.disable('x-powered-by');
app.use(bodyParser.json());
app.locals.pretty = development;

app.get('/iAmAdmin', (req, res) => {
    req.session.admin = true;
    req.session.save(res.redirect('/'));
});

app.use('*', (req, res, next) => {
    req.context = {};
    req.context.admin = req.session.admin;
    next();
});

app.get('*', (req, res) => res.render('index', { context: req.context || {} }));

app.listen(app.get('port'), () => console.log('Listening on port %d', app.get('port')));
