import * as types from 'app/actions/types';

export default function (state = '', action) {
    switch (action.type) {

    case types.LOGIN_SUCCESS:
    case types.REGISTER_SUCCESS:
        return action.username;

    case types.LOGOUT:
        return null;

    default:
        return state;
    }
}
