#Survey!
http://eric.pizza

### Requirements/Dependencies
Everything was developed/tested on Node 4.2.X on OSX.  Your results may vary if you choose to use a different version of Node/OS. Prod is hosted on a Digital Ocean Ubuntu 14.04/dokku instance... so that's always an option too if you need it!  

I'm using React/Redux for the client side app, and then express/sequelize for the server side stuff. If you're not too familiar with React/Flux/Redux, [these](https://code-cartoons.com/) are a pretty good high level overview.

####You'll Need:
- A mysql instance running! With a user you have access to and a fresh db.
- A session secret! This is just a string, that in theory, is secret!
- Redis? I use Redis for session management locally and in prod... but in 'theory' it should fall back to memory session storage if you omit the config vars. 

Create a `local.json` file inside of the `config/` directory and put all the relevant details inside. Here's what mine looks like!

```json
{
    "dbName": "survey",
    "dbUser": "root",
    "dbPassword": "",
    "dbHost": "localhost",
    "dbPort": 5432,
    "sessionSecret": "SUPER SEKRET",
    "redisIP": "localhost",
    "redisPort": 6379
}
```

### Setup/Install/Run
1. First clone this repo!
2. `npm install`
3. Setup your local.json config. :arrow_up:
4. `npm run build`  Bundles the js up and places it in the build dir.
5. `npm start` Starts the server! (Give it a few sec to transpile the es6 on start up)

By default the app listens on port 3000, so you should be able to hit http://localhost:3000

### Usage
You'll initially be presented with a 'Sorry' message without any questions!  Attempt to login, and then register a user to gain access to the dashboard. From the dashboard you can add new questions, and view the responses to the questions you've asked.

Anonymous users are allowed to answer questions that have been posed by other users.  After registering this history follows them, and even after logging in they shouldn't see questions they've already answered. For the most part... (See [Limitations](#limitations-and-further-improvement))  If the anonymous user clears their cookies they'll regenerated upon refresh and they'll be treated anew.

#####Home/Answer Question

On the home screen you'll continue to receive random questions from other users until you exhaust the db or you give up. :smile:  You can use the previous arrow to correct a previously mistaken answer, but know that option is temporary.  Should you logout or refresh, that history will be gone!


#####New Question
Hopefully pretty straight forward! Fill out the form, and hit 'Ask' at the bottom!  You'll need a prompt and at least two choices. You'll be kicked back to the home screen after submitting.  You can't answer your own questions, so even after a refresh you won't be able to find it.  You can logout/clear your cookies though if you'd like and view it anonymously.

#####Stats!
These will be blank if haven't asked any questions yet... or if it's loading!  Use the next and previous arrows at the bottom to view basic stats about your questions' responses.

###Limitations and Further Improvement
- You can view stats the answers your questions have received, but not other users' questions you've answered!  Might be nice to go back and see your answer history.
- Probably should be able to link to questions directly for sharing purposes.  Just a slight extension of `/api/questions`...
  - Given that, it'd be semitrivial to persist the question history on the home screen to session, so it didn't disappear on refresh.  Or even link to questions you've answered on the stats page so you could edit your response.
- Registering a new user will transfer user data appropriately from the anonymous user to the new user as mentioned above... but answering questions anonymously and then logging into an EXISTING user will not. (Registering a new user is just updating the username on an anonymous user).  When logging in we  need to copy the answers/questions from the anonymous user to the existing user... and then delete the anonymous user. (Merge the two).  Not impossible... just not done. ha.
- Loading spinners?  Most of the states/actions are in place to add loading spinners etc while api calls are in flight. You may see hiccups and delays currently as there are no visible indications of such!
- Error codes should be pulled out into some constants that can be shared between client and backend.
- :flushed: Tests? ¯\\\_(ツ)\_/¯
- Scale?  None of the sql queries are paginated...  That home page question history should probably truncated after some # of questions instead of growing indefinitely.  Stats attempts to retrieve ALL your question stats up front...
- Speaking of sql... I should probably sanitize the inputs. Maybe sequelize does that automatically. That'd be nice.
- Passwords should be encrypted. Most users appreciate that.
- Minification/cdnification of js/css/svgs etc etc.

