import * as types from 'app/actions/types';

export default function (state = '', action) {
    switch (action.type) {

    case types.LOGIN_SUCCESS:
        return action.username;

    default:
        return state;
    }
}
