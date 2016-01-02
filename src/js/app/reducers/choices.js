import * as types from 'app/actions/types';

export default function (state = [], action) {
    switch (action.type) {
    case types.ADD_CHOICE:
        if (state.length >= 5) return state;
        return [...state, {
            value: '',
        }];
    case types.UPDATE_CHOICE:
        return [
            ...state.slice(0, action.index),
            Object.assign({}, state[action.index], { value: action.newValue }),
            ...state.slice(action.index + 1),
        ];
    case types.REMOVE_CHOICE:
        if (state.length <= 2) return state;

        return [...state.slice(0, action.index), ...state.slice(action.index + 1)];
    default:
        return state;
    }
}
