import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import questionForm from './questionForm';
import loginForm from './loginForm';
import username from './username';
const rootReducer = combineReducers({
    routing: routeReducer,
    questionForm,
    loginForm,
    username,
});

export default rootReducer;
