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
    url: config.has('redisUrl') ? config.get('redisUrl') : undefined,
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

const sequelize = config.has('dbUrl') ?

    new Sequelize(config.get('dbUrl')) :

    new Sequelize(config.get('dbName'), config.get('dbUser'), config.get('dbPassword'), {
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
const UserAnswer = require('./models/userAnswer').default(sequelize);

User.hasMany(Question);
Question.hasMany(Choice);
UserAnswer.belongsTo(User);
UserAnswer.belongsTo(Question);
UserAnswer.belongsToMany(Choice, { through: 'answerChoice' });
Choice.belongsToMany(UserAnswer, { through: 'answerChoice' });
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

app.post('/api/login', (req, res) => {
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

app.post('/api/register', (req, res) => {
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

app.post('/api/questions', (req, res) => {
    const { prompt = '', choices = [], multiAnswer = false } = req.body || {};
    if (!prompt || !choices.length > 1) return res.status(400).json({ err: { code: 103, msg: 'Missing required fields.' } });

    Question.create({ prompt, multiAnswer, userId: req.user.id })
            .then(newQuestion => Promise.all([newQuestion, Choice.bulkCreate(choices.map(({ value }) => Object.assign({ value, questionId: newQuestion.id })))]))
            .then(([{ id: newQuestionId }]) => res.status(201).json({ newQuestionId }));
});

app.post('/api/questions/:id', (req, res) => {
    const userId = req.user.id;
    const questionId = req.params.id;
    UserAnswer.findOrCreate({
        where: {
            userId,
            questionId,
        },
    }).then(([userAnswer]) => userAnswer.setChoices(req.body.choices.filter(c => c.checked).map(c => c.id)))
      .then(() => res.status(200).json({}));
});

app.get('/api/questions', (req, res) => {
    Question.findAll({
        where: {
            userId: req.user.id,
        },
        include: [{
            model: Choice,
            include: UserAnswer,
        }],
        order: 'createdAt DESC',
    }).then((results) => res.status(200).json(results.map(r => r.toJSON())));
});

app.get('/api/questions/random', (req, res) => {
    const userId = req.user.id;
    sequelize.query(`
        SELECT Q.* FROM questions Q
        LEFT OUTER JOIN userAnswers UA on Q.id = UA.questionId AND UA.userId = ${userId}
        WHERE Q.userId != ${userId} and UA.id IS NULL
        ORDER BY RAND()
        LIMIT 1
    `, { model: Question }).then(([question = null]) => {
        if (!question) return res.status(200).json(question);
        return question.getChoices().then(choices => res.status(200).json(Object.assign(question.toJSON(), { choices: choices.map(c => c.toJSON()) })));
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
