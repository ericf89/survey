import * as types from './types';
import superagent from 'superagent';
import { pushPath } from 'redux-simple-router';

export function updateForm(formProp, newValue) {
    return {
        type: types.UPDATE_FORM,
        formProp,
        newValue,
        meta: { debounce: { time: 300 } },
    };
}

export function addChoice(index) {
    return {
        type: types.ADD_CHOICE,
        index,
    };
}
export function updateChoice(index, newValue) {
    return {
        type: types.UPDATE_CHOICE,
        index,
        newValue,
    };
}
export function removeChoice(index) {
    return {
        type: types.REMOVE_CHOICE,
        index,
    };
}

export function login(username, password) {
    return dispatch => {
        if (!username || !password) return;
        dispatch({ type: types.LOGIN, username, password });
        superagent.post('/api/login')
                  .send({ username, password })
                  .end((err, res) => {
                      const type = err ? types.LOGIN_FAILURE : types.LOGIN_SUCCESS;
                      const { msg, code } = res.body.err || {};
                      dispatch({ type, msg, code, username });
                      if (type === types.LOGIN_SUCCESS) dispatch(pushPath('/'));
                  });
    };
}

export function register(username, password) {
    return dispatch => {
        if (!username || !password) return;
        dispatch({ type: types.REGISTER, username, password });
        superagent.post('/api/register')
                  .send({ username, password })
                  .end((err, res) => {
                      const type = err ? types.REGISTER_FAILURE : types.REGISTER_SUCCESS;
                      const { msg, code } = res.body.err || {};
                      dispatch({ type, msg, code, username });
                      if (type === types.REGISTER_SUCCESS) dispatch(pushPath('/'));
                  });
    };
}

export function logout() {
    return dispatch => {
        superagent.post('/logout')
                  .send({})
                  .end(err => {
                      if (err) return;
                      dispatch({ type: types.LOGOUT });
                      dispatch(pushPath('/'));
                  });
    };
}

export function submitNewQuestion() {
    return (dispatch, getState) => {
        dispatch({ type: types.SUBMIT_FORM });
        const { questionForm } = getState();
        superagent.post('/api/questions')
                  .send(questionForm)
                  .end((err, res) => {
                      const type = err ? types.SUBMIT_FORM_FAILURE : types.SUBMIT_FORM_SUCCESS;
                      const { msg, code } = res.body.err || {};
                      dispatch({ type, msg, code });
                      dispatch(pushPath('/stats/'));
                  });
    };
}

export function getCurrentStats() {
    return dispatch => {
        dispatch({ type: types.GET_STATS });
        superagent.get('/api/questions')
                  .end((err, res) => {
                      const type = err ? types.GET_STATS_FAILURE : types.GET_STATS_SUCCESS;
                      if (err) return dispatch({ type });
                      dispatch({ type, questions: res.body });
                  });
    };
}

export function nextStat() { return { type: types.NEXT_STAT }; }
export function previousStat() { return { type: types.PREVIOUS_STAT }; }
export function nextQuestion() { return { type: types.NEXT_QUESTION }; }
export function previousQuestion() { return { type: types.PREVIOUS_QUESTION }; }

export function getNextQuestion() {
    return dispatch => {
        dispatch({ type: types.GET_NEXT_QUESTION });
        superagent.get('/api/questions/random')
                  .end((err, res) => {
                      const type = err ? types.GET_NEXT_QUESTION_FAILURE : types.GET_NEXT_QUESTION_SUCCESS;
                      if (err) return dispatch({ type });
                      dispatch({ type, question: res.body });
                  });
    };
}

export function toggleChoice(index) {
    return {
        type: types.TOGGLE_CHOICE,
        index,
    };
}

export function answerQuestion() {
    return (dispatch, getState) => {
        dispatch({ type: types.ANSWER_QUESTION });
        const { home: { questions, questionIndex } } = getState();
        const question = questions[questionIndex];
        superagent.post(`/api/questions/${question.id}`)
                  .send(question)
                  .end((err) => {
                      const type = err ? types.ANSWER_QUESTION_FAILURE : types.ANSWER_QUESTION_SUCCESS;
                      if (err) return dispatch({ type });
                      dispatch(getNextQuestion());
                  });
    };
}
