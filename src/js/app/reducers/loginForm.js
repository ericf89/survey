import * as types from 'app/actions/types';

const defaultState = {
    errorMessage: '',
    loading: false,
};

export default function (state = defaultState, action) {
    switch (action.type) {

    case types.LOGIN:
    case types.REGISTER:
        return Object.assign({}, state, { loading: true });

    case types.LOGIN_SUCCESS:
    case types.LOGIN_FAILURE:
    case types.REGISTER_SUCCESS:
    case types.REGISTER_FAILURE:
        const newState = { loading: false, infoMessage: undefined, errorMessage: undefined };
        const { code, msg } = action;

        newState[code === 101 ? 'infoMessage' : 'errorMessage'] = msg;
        return Object.assign({}, state, newState);

    default:
        return state;
    }
}
