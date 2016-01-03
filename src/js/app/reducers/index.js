import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import questionForm from './questionForm';
import loginForm from './loginForm';
import username from './username';
import stats from './stats';
import home from './home';

const rootReducer = combineReducers({
    routing: routeReducer,
    questionForm,
    loginForm,
    username,
    stats,
    home,
});

export default rootReducer;
