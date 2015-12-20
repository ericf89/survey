import * as types from './types';

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
