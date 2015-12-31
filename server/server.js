import express from 'express';
import config from 'config';
import Sequelize from 'sequelize';
import redisStore from 'connect-redis';
import bodyParser from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import sassMiddleware from 'node-sass-middleware';
import passport from 'passport';
import { Strategy } from 'passport-local';
import morgan from 'morgan';

const app = express();
const development = config.get('nodeEnv') === 'development';
app.set('port', config.get('port'));
app.locals.pretty = development;
app.use(compression());
app.use(morgan(development ? 'dev' : 'combined'));
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


app.use(sassMiddleware({
    src: 'src/scss/',
    dest: 'build/css',
    debug: development,
    outputStyle: 'compressed',
    prefix: '/css/',
}));

const sequelize = new Sequelize(config.get('dbName'), config.get('dbUser'), config.get('dbPassword'), {
    host: config.get('dbHost'),
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: true,
        paranoid: true,
    },
});

const User = require('./models/user').default(sequelize);
const Question = require('./models/question').default(sequelize);
const Choice = require('./models/choice').default(sequelize);
const userAnswer = require('./models/userAnswer').default(sequelize);

User.hasMany(Question);
Question.hasMany(Choice);
userAnswer.belongsTo(User);
userAnswer.belongsTo(Question);
userAnswer.belongsToMany(Choice, { through: 'answerChoice' });
Choice.belongsToMany(userAnswer, { through: 'answerChoice' });
sequelize.sync();

passport.use(new Strategy(
  (username, password, cb) => {
      User.findOne({ where: { username } }).then(user => {
          if (!user) return cb(null, false);
          if (user.password !== password) return cb(null, false);
          return cb(null, user);
      });
  }));

passport.serializeUser((user, cb) => {
    cb(null, user.dataValues.id);
});

passport.deserializeUser((id, cb) => {
    User.findOne({ where: { id } }).then(user => cb(null, user));
});

app.use(passport.initialize());
app.use(passport.session());

app.set('views', 'server/views');
app.use(express.static('build'));
app.set('view engine', 'jade');
app.disable('x-powered-by');
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400);

    Promise.all([
        User.findOne({ where: { username } }),
        User.findOne({ where: { username: req.session.id } }),
    ]).then(results => {
        const [requestedUser, sessionUser] = results;
        if (requestedUser && password === requestedUser.password) {
            if (sessionUser) {
                // Copy all session user stuff to real user.
                // Delete session user.
            }
            return req.logIn(requestedUser, () => res.status(200).json({}));
        }
        return res.status(401).json({ err: { code: requestedUser ? 100 : 101, msg: requestedUser ? 'Invalid password.' : 'That user doesn\'t exist yet... Correct your info and login again or register it!' } });
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400);

    Promise.all([
        User.findOne({ where: { username } }),
        User.findOne({ where: { username: req.session.id } }),
    ]).then(results => {
        const [requestedUser, sessionUser] = results;
        if (requestedUser) return res.status(400).json({ err: { code: 102, msg: 'User already exists.' } });
        sessionUser.update({ username, password }).then(() => {
            return req.logIn(sessionUser, () => res.status(200).json({ username }));
        }).catch(() => res.status(500).json({ err: { code: 500, msg: '-_-' } }));
    });
});

app.use('/logout', (req, res) => {
    return req.session.destroy((err) => {
        if (err) return res.status(500).json({ err: { code: 500, msg: err } });
        return res.redirect('/');
    });
});

app.use((req, res, next) => {
    if (req.user) return next();
    User.findOrCreate({
        where: { username: req.session.id },
    }).spread((dbUser) => req.logIn(dbUser, next));
});


app.use('*', (req, res, next) => {
    const username = req.user && req.user.username.length < 30 ? req.user.username : undefined;
    req.context = { username };
    next();
});

app.get('*', (req, res) => res.render('index', { context: req.context || {} }));

app.listen(app.get('port'), () => console.log('Listening on port %d', app.get('port')));
