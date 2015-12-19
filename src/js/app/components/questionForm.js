import React from 'react';
import { connect } from 'react-redux';
import CloseSVG from 'app/components/svgs/close';
import AddSVG from 'app/components/svgs/add';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const QuestionForm = React.createClass({
    getInitialState() {
        return Object.assign({
            prompt: '',
            choices: [{ id: 0, value: '' }, { id: 1, value: '' }],
            idCounter: 2,
            multiAnswer: false,
        }, this.props);
    },
    getId() {
        this.setState(state => state.idCounter++);
        return this.state.idCounter;
    },
    updateChoice(index) {
        return ({ target: { value } }) => this.setState(state => state.choices[index].value = value);
    },
    addChoice(cb) {
        if (this.state.choices.length < 5) {
            const newId = this.getId();
            this.setState(state => state.choices.push({ id: newId, value: '' }), () => typeof cb === 'function' ? cb(newId) : null);
        }
    },
    choiceEnterKeyHandler(key, index) {
        const choices = this.state.choices;
        if (key === 'Enter') {
            if (index === choices.length - 1) {
                this.addChoice((newChoiceId) => this.refs[newChoiceId].focus());
            } else {
                this.refs[choices[index + 1].id].focus();
            }
        }
    },
    render() {
        const { prompt, choices, multiAnswer } = this.state;
        let ctaButton = null;
        if (prompt.trim() !== '' && choices.length >= 2 && choices.every(c => c.value.trim() !== '')) {
            ctaButton = (
                <div className="row">
                    <div className="col s12 m4 offset-m4">
                        <span className="btn-large center"> Ask Away! </span>
                    </div>
                </div>
            );
        }
        return (
            <div className="question-form">
                <div className="row">
                    <h3>New Question</h3>
                </div>
                <div className="row">
                    <div className="col s12">
                        <h6>Prompt:</h6>
                        <input type="text" placeholder="What's your favorite topping?" value={prompt} onChange={({ target: { value } }) => this.setState(state => state.prompt = value)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12">
                        Accept multiple answers?
                        <div className="switch">
                            <label>
                                No
                                <input type="checkbox" checked={multiAnswer} onChange={({ target: { checked } }) => this.setState(state => state.multiAnswer = checked)} />
                                <span className="lever"></span>
                                Yes
                            </label>
                        </div>
                    </div>
                </div>
                <ReactCSSTransitionGroup component="div" transitionName="slide" transitionEnterTimeout={250} transitionLeaveTimeout={250}>
                    {choices.map((choice, i) => (
                        <div key={`choice_key_${String(choice.id)}`} className="row">
                            <div className="col s1">
                                <input disabled="disabled" id={`choice_${i}`} type={multiAnswer ? 'checkbox' : 'radio'}/>
                                <label htmlFor={`choice_${i}`}></label>
                            </div>
                            <div className="col s10">
                                <input type="text" ref={choice.id} value={choice.value} onKeyPress={({ key }) => this.choiceEnterKeyHandler(key, i)} onChange={this.updateChoice(i)} placeholder="Enter an option" />
                            </div>
                            <div className="col s1" onClick={() => this.setState(state => state.choices.length > 2 ? state.choices.splice(i, 1) : state)}>
                                { choices.length > 2 ? React.createElement(CloseSVG) : null}
                            </div>
                        </div>
                    ))}
                    <div className="row">
                        <div className="col offset-s11 s1">
                            { choices.length < 5 ? React.createElement('span',
                                {
                                    className: 'btn-floating',
                                    onClick: this.addChoice,
                                }, React.createElement(AddSVG)) : null
                            }
                        </div>
                    </div>
                    {ctaButton}
                </ReactCSSTransitionGroup>
            </div>
        );
    },
});


export default connect(i => i)(QuestionForm);
