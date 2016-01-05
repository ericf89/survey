import * as types from 'app/actions/types';

const defaultState = {
    questions: [null],
    currentIndex: 0,
};

export default function (state = defaultState, action) {
    switch (action.type) {
    case types.GET_STATS_SUCCESS:
        return Object.assign({}, state, { questions: action.questions });
    case types.NEXT_STAT:
        return Object.assign({}, state, { currentIndex: state.currentIndex + 1 });
    case types.PREVIOUS_STAT:
        return Object.assign({}, state, { currentIndex: state.currentIndex - 1 });

    case types.LOGIN_SUCCESS:
    case types.LOGOUT:
        return Object.assign({}, defaultState);
    default:
        return state;
    }
}
