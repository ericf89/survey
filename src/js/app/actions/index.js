import * as types from './types';
import superagent from 'superagent';
export function updateForm(formProp, newValue) {
    return {
        type: types.UPDATE_FORM,
        formProp,
        newValue,
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
        dispatch({ type: types.LOGIN, username, password });
        superagent.post('/login')
                  .send({ username, password })
                  .end((err, res) => {
                      const type = err ? types.LOGIN_FAILURE : types.LOGIN_SUCCESS;
                      dispatch({ type, res });
                  });
    };
}
