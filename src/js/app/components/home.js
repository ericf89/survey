import React, { PropTypes } from 'react';
import cn from 'classnames';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { getNextQuestion, toggleChoice, answerQuestion, nextQuestion, previousQuestion } from 'app/actions';
import NextIcon from 'app/components/svgs/next.js';
import PreviousIcon from 'app/components/svgs/previous.js';

const Home = React.createClass({
    propTypes: {
        dispatch: PropTypes.func.isRequired,
        questions: PropTypes.array.isRequired,
        questionIndex: PropTypes.number.isRequired,
        loading: PropTypes.bool.isRequired,
        username: PropTypes.string,
    },
    componentWillMount() {
        Object.defineProperty(this, 'question', {
            get: () => this.props.questions[this.props.questionIndex],
        });
        const { dispatch } = this.props;
        if (!this.question) {
            dispatch(getNextQuestion());
        }
    },
    renderWelcome() {
        if (this.props.username) return null;
        return (
            <div>
                <div className="row col s12 center">
                    <h5>Welcome to Pizza Survey</h5>
                    <p>Answer some questions below, or write some of your own by <Link to="/login">registering/logging in</Link>!</p>
                </div>
                <div className="divider"/>
            </div>
        );
    },
    renderNoQuestion() {
        return (
            <div className="row col s12 center">
                <h5>Wow!</h5>
                <p>Either, something went wrong... or you've answered all the questions there are to answer!</p>
                <p><Link to="/dashboard/">Write some</Link> of your own, or refresh in a bit!</p>
            </div>
        );
    },
    renderQuestion(question) {
        const { dispatch } = this.props;
        const { prompt, multiAnswer, choices } = question;

        return (
            <div>
                <div className="row">
                    <div className="col s12">
                        <h4>{prompt}</h4>
                    </div>
                    {choices.map((choice, i) => (
                        <div key={`choice_${i}`} className="row">
                            <div className="col s12">
                                <input
                                  checked={choice.checked}
                                  onChange={() => dispatch(toggleChoice(i))}
                                  id={`choice_${i}`}
                                  name="group"
                                  type={multiAnswer ? 'checkbox' : 'radio'}
                                />
                                <label htmlFor={`choice_${i}`}>{choice.value}</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    },
    render() {
        const { questionIndex, questions, dispatch, loading } = this.props;
        const { question } = this;

        const showNext = questionIndex < questions.length - 1;
        const showPrevious = questionIndex > 0;

        const valid = question && question.choices.some(c => c.checked);
        return (
            <div>
                {this.renderWelcome()}
                {question ? this.renderQuestion(question) : this.renderNoQuestion()}
                <div className="row">
                    <div className="col s1" onClick={() => dispatch(previousQuestion())}>
                        { showPrevious ?
                            <PreviousIcon/>
                            : null
                        }
                        &nbsp;
                    </div>
                    <div className="col s10 center">
                        <span className={cn('btn large', { disabled: !valid, hide: !question })} onClick={ () => valid ? dispatch(answerQuestion()) : null}>
                            { loading ? 'Loading...' : 'Submit' }
                        </span>
                    </div>
                    <div className="col s1" onClick={() => dispatch(nextQuestion())} >
                        { showNext ?
                            <NextIcon />
                            : null
                        }
                        &nbsp;
                    </div>
                </div>
            </div>
        );
    },
});

export default connect(s => Object.assign(s.home, { username: s.username }))(Home);
