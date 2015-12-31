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

export function addChoice(id) {
    return {
        type: types.ADD_CHOICE,
        id,
    };
}
export function updateChoice(index, newValue) {
    return {
        type: types.UPDATE_CHOICE,
        index,
        newValue,
        meta: { debounce: { time: 300 } },
    };
}
export function removeChoice(id) {
    return {
        type: types.REMOVE_CHOICE,
        id,
    };
}

export function login(username, password) {
    return dispatch => {
        if (!username || !password) return;
        dispatch({ type: types.LOGIN, username, password });
        superagent.post('/login')
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
        superagent.post('/register')
                  .send({ username, password })
                  .end((err) => {
                      const type = err ? types.REGISTER_FAILURE : types.REGISTER_SUCCESS;
                      const { msg, code } = err || {};
                      dispatch({ type, msg, code, username });
                      if (type === types.REGISTER_SUCCESS) dispatch(pushPath('/'));
                  });
    };
}

export function logout() {
    return dispatch => {
        superagent.post('/logout')
                  .send({})
                  .end((err) => {
                      if (err) return;
                      dispatch({ type: types.LOGOUT });
                      dispatch(pushPath('/'));
                  });
    };
}
