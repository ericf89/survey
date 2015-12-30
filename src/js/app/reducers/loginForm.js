import * as types from 'app/actions/types';

const defaultState = {
    errorMessage: '',
    loading: false,
};

export default function (state = defaultState, action) {
    switch (action.type) {

    case types.LOGIN:
        return Object.assign({}, state, { loading: true });

    case types.LOGIN_SUCCESS:
    case types.LOGIN_FAILURE:
        return Object.assign({}, state, { loading: false, errorMessage: action.err });

    default:
        return state;
    }
}
