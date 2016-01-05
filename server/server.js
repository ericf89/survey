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

const useRedis = (storeOptions.host && storeOptions.port) || storeOptions.url;
if (useRedis) console.log('Using redis for session storage');
app.use(session({
    store: useRedis ? new Store(storeOptions) : undefined,
    secret: config.get('sessionSecret'),
    saveUninitialized: true,
    resave: true,
}));

// This nifty middleware compiles sass on the fly. No need for another buildstep!
app.use(sassMiddleware({
    src: 'src/scss/',
    dest: 'build/css',
    debug: development,
    outputStyle: 'compressed',
    prefix: '/css/',
}));

// We give the dbUrl priority when setting up Sequlize but either will work.
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

User.hasMany(Question); // Users They have a name and a password. They can submit questions.
Question.hasMany(Choice); // Questions have a prompt, and a bool to keep track of whether or not multiple responses are allowed. They have multiple choices.
UserAnswer.belongsTo(User); // UserAnswers represent a users answer to a particular question.  It ties together A user, the question they're answering, and the choices they selected.
UserAnswer.belongsTo(Question);
UserAnswer.belongsToMany(Choice, { through: 'answerChoice' });
Choice.belongsToMany(UserAnswer, { through: 'answerChoice' });
sequelize.sync();

// Boilerplate session/user stuff.  No encryption here!
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

// Setup sessions and passport.
app.use(passport.initialize());
app.use(passport.session());

app.set('views', 'server/views');
app.use(express.static('build')); // Server all our static content. (Everything we've bundled/built.)
app.set('view engine', 'jade');
app.disable('x-powered-by');
app.use(bodyParser.json());

// The client posts here when logging on.
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400); // Bail out right away if we're missing stuff.

    // We  first attempt to look up a user both by the username provided, and by their session id. (Anonymous users username is their session id).
    Promise.all([
        User.findOne({ where: { username } }),
        User.findOne({ where: { username: req.session.id } }),
    ]).then(([requestedUser, sessionUser]) => {
        if (requestedUser && password === requestedUser.password) {
            if (sessionUser) {
                // If we have a user and a proper password, but also have a matching session user, we need to merge the two! Someday...
                // TODO: Copy all session user stuff to real user. Delete session user.
            }
            return req.logIn(requestedUser, () => res.status(200).json({})); // Login the user and return 200.
        }
        // We send back an error code or messaging here based on whether or not the user existed.  This is how the client knows to prompt to register.
        return res.status(401).json({ err: { code: requestedUser ? 100 : 101, msg: requestedUser ? 'Invalid password.' : 'That user doesn\'t exist yet... Correct your info and login again or register it!' } });
    });
});

// Very similar to login...
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400);

    Promise.all([
        User.findOne({ where: { username } }),
        User.findOne({ where: { username: req.session.id } }),
    ]).then(results => {
        const [requestedUser, sessionUser] = results;
        if (requestedUser) return res.status(400).json({ err: { code: 102, msg: 'User already exists.' } });
        // Update the session user with their supplied username and password.
        sessionUser.update({ username, password }).then(() => {
            return req.logIn(sessionUser, () => res.status(200).json({ username }));
        }).catch(() => res.status(500).json({ err: { code: 500, msg: '-_-' } }));
    });
});

app.post('/api/questions', (req, res) => {
    const { prompt = '', choices = [], multiAnswer = false } = req.body || {};
    if (!prompt || !choices.length > 1) return res.status(400).json({ err: { code: 103, msg: 'Missing required fields.' } });

    Question.create({ prompt, multiAnswer, userId: req.user.id }) // Create the question.
            .then(newQuestion => Promise.all([newQuestion, Choice.bulkCreate(choices.map(({ value }) => Object.assign({ value, questionId: newQuestion.id })))])) // Create the choices with that questionId
            .then(([{ id: newQuestionId }]) => res.status(201).json({ newQuestionId })); // Return the question id to the frontend...
});

// Posting to a particular id 'answers' the question.  I'm up for a RESTful debate.  Maybe this should be /question/answer/:choiceId?
// But then how do you handle multiple answers? This should probably be a PUT with the updated choice array in the body of the question.
app.post('/api/questions/:id', (req, res) => {
    const userId = req.user.id;
    const questionId = req.params.id;
    UserAnswer.findOrCreate({
        where: {
            userId,
            questionId,
        },
    }).then(([userAnswer]) => userAnswer.setChoices(req.body.choices.filter(c => c.checked).map(c => c.id)))  // Update the user answer to matched the 'selected' choices in the POST body.
      .then(() => res.status(200).json({}));
});

// Used for the stats page... this returns all questions and their choices/user/answers.
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
    // Theres probably a way to do this through the sequelize api... but this seemed cleanest.
    // I've read stuff that RAND() is bad bad performance-wise... but I guess it's ok for now.
    // Basically selects a question that both doesn't exist in this user's userAnswers and doesn't
    // belong to this user.
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

// We hit the database on every request to make sure we have a matching user in the db. Anonymous or otherwise.
// Looks scary but should only happen on initial requests... Passport and redis should do the heavy lifting...
app.use((req, res, next) => {
    if (req.user) return next();
    User.findOrCreate({
        where: { username: req.session.id },
    }).spread((dbUser) => req.logIn(dbUser, next));
});

// This context gets passed to the frontend.
app.use((req, res, next) => {
    // Kind of a hacky way to determine if the user's logged in or not...
    // Anonymous users have no password. Client assumes that if there's no username the user is anonymous.
    const username = req.user && req.user.password ? req.user.username : undefined;
    req.context = { username };
    next();
});

// For any requests that don't match any of the above, spit back the html template that includes the client side app.
app.get('*', (req, res) => res.render('index', { context: req.context || {} }));

app.listen(app.get('port'), () => console.log('Listening on port %d', app.get('port')));
