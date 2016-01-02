import * as types from 'app/actions/types';
import choices from './choices';

const defaultState = {
    prompt: '',
    choices: [{ id: 0, value: '' }, { id: 1, value: '' }],
    idCounter: 2,
    multiAnswer: false,
    loading: false,
};

export default function (state = defaultState, action) {
    switch (action.type) {

    case types.UPDATE_FORM:
        return Object.assign({}, state, { [action.formProp]: action.newValue });

    case types.ADD_CHOICE:
    case types.UPDATE_CHOICE:
    case types.REMOVE_CHOICE:
        return Object.assign({}, state, { choices: choices(state.choices, action) });

    case types.SUBMIT_FORM:
        return Object.assign({}, state, { loading: true });

    case types.SUBMIT_FORM_SUCCESS:
        return Object.assign({}, defaultState);
    case types.SUBMIT_FORM_FAILURE:
        return Object.assign({}, state, { loading: false });
    default:
        return state;
    }
}
