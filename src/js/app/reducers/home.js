import * as types from 'app/actions/types';

const defaultState = {
    questionIndex: 0,
    questions: [],
    loading: false,
};

function toggleChoice(state, index, multiAnswer) {
    if (multiAnswer) {
        return [...state.slice(0, index),
                Object.assign({}, state[index], { checked: !state[index].checked }),
                ...state.slice(index + 1),
                ];
    }
    const newValue = !state[index].checked;
    return state.map((c, i) => Object.assign({}, c, { checked: i === index ? newValue : !newValue }));
}

export default function (state = defaultState, action) {
    switch (action.type) {
    case types.NEXT_QUESTION:
        return Object.assign({}, state, { questionIndex: state.questionIndex + 1 });

    case types.PREVIOUS_QUESTION:
        return Object.assign({}, state, { questionIndex: state.questionIndex - 1 });

    case types.ANSWER_QUESTION:
    case types.GET_NEXT_QUESTION:
        return state.loading ? state : Object.assign({}, state, { loading: true });

    case types.GET_NEXT_QUESTION_SUCCESS:
        const newQuestions = [...state.questions, action.question].filter(x => !!x);
        if (!action.question) newQuestions.push(null);
        return Object.assign({}, {
            questions: newQuestions,
            questionIndex: newQuestions.length - 1,
            loading: false,
        });

    case types.ANSWER_QUESTION_FAILURE:
    case types.GET_NEXT_QUESTION_FAILURE:
        return Object.assign({}, state, { loading: false });

    case types.TOGGLE_CHOICE:
        const { questions, questionIndex } = state;
        const question = questions[questionIndex];
        const newChoices = toggleChoice(question.choices, action.index, question.multiAnswer);
        return Object.assign({}, state, {
            questions: [...questions.slice(0, questionIndex),
                        Object.assign({}, question, { choices: newChoices }),
                        ...questions.slice(questionIndex + 1),
                        ],
        });

    case types.LOGIN_SUCCESS:
    case types.LOGOUT:
        return Object.assign({}, defaultState);

    default:
        return state;
    }
}
