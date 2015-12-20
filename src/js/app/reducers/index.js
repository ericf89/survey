import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import questionForm from './questionForm';
const rootReducer = combineReducers({
    routing: routeReducer,
    questionForm,

});

export default rootReducer;
