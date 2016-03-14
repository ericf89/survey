import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import CloseSVG from 'app/components/svgs/close';
import AddSVG from 'app/components/svgs/add';
import { updateForm, addChoice, updateChoice, removeChoice, submitNewQuestion } from 'app/actions';
import DelayedInput from 'react-debounce-input';

const QuestionForm = React.createClass({
    propTypes: {
        dispatch: PropTypes.func.isRequired, // Injected by connect.
        prompt: PropTypes.string.isRequired,
        choices: PropTypes.array.isRequired,
        multiAnswer: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired,
    },
    getInitialState() {
        const choices = this.props.choices;
        const idCounter = choices[choices.length - 1].id + 1;
        return { idCounter };
    },
    componentDidUpdate(prevProps) {
        const choices = this.props.choices;
        if (choices.length > prevProps.choices.length) {
            findDOMNode(this.refs[`choice_${this.props.choices.length - 1}`]).focus();
        }
    },
    getId() {
        this.setState(state => state.idCounter++);
        return this.state.idCounter;
    },
    updateChoice(index) {
        return ({ target: { value } }) => this.props.dispatch(updateChoice(index, value));
    },
    addChoice() {
        this.props.dispatch(addChoice(this.getId()));
    },
    choiceEnterKeyHandler(key, index) {
        const choices = this.props.choices;
        if (key === 'Enter') {
            if (index === choices.length - 1) {
                this.addChoice();
            } else {
                findDOMNode(this.refs[`choice_${index + 1}`]).focus();
            }
        }
    },
    render() {
        const { prompt, choices, multiAnswer, dispatch, loading } = this.props;
        let ctaButton = null;
        if (prompt.trim() !== '' && choices.length >= 2 && choices.every(c => c.value.trim() !== '')) {
            ctaButton = (
                <div className="row">
                    <div className="col s12 m4 offset-m4">
                        <span className="btn-large center" onClick={() => dispatch(submitNewQuestion())}>
                            { loading ? 'Loading...' : 'Ask Away!' }
                        </span>
                    </div>
                </div>
            );
        }
        return (
            <div className="question-form">
                <div className="row">
                    <div className="col s12">
                        <h6>Prompt:</h6>
                        <DelayedInput debounceTimeout={300} type="text" placeholder="What's your favorite topping?" value={prompt} onChange={({ target: { value } }) => dispatch(updateForm('prompt', value)) } />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12">
                        Accept multiple answers?
                        <div className="switch">
                            <label>
                                No
                                <input type="checkbox" checked={multiAnswer} onChange={({ target: { checked } }) => dispatch(updateForm('multiAnswer', checked))} />
                                <span className="lever"></span>
                                Yes
                            </label>
                        </div>
                    </div>
                </div>
                {choices.map((choice, i) => (
                    <div key={`choice_${i}`} className="row">
                        <div className="col s1">
                            <input disabled="disabled" id={`choice_${i}`} type={multiAnswer ? 'checkbox' : 'radio'}/>
                            <label htmlFor={`choice_${i}`}></label>
                        </div>
                        <div className="col s10">
                            <DelayedInput debounceTimeout={300} type="text" ref={`choice_${i}`} value={choice.value} onKeyPress={({ key }) => this.choiceEnterKeyHandler(key, i)} onChange={this.updateChoice(i)} placeholder="Enter an option" />
                        </div>
                        <div className="col s1" onClick={() => { this.refs[`choice_${i}`].notify.cancel(); dispatch(removeChoice(i)); }}>
                            { choices.length > 2 ? React.createElement(CloseSVG) : null}
                        </div>
                    </div>
                ))}
                <div className="row">
                    <div className="col offset-s10 s1">
                        { choices.length < 5 ? React.createElement('span',
                            {
                                className: 'btn-floating',
                                onClick: this.addChoice,
                            }, React.createElement(AddSVG)) : null
                        }
                    </div>
                </div>
                {ctaButton}
            </div>
        );
    },
});


export default connect(state => state.questionForm)(QuestionForm);
