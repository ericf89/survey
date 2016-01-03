import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getCurrentStats, nextStat, previousStat } from 'app/actions';
import NextIcon from 'app/components/svgs/next.js';
import PreviousIcon from 'app/components/svgs/previous.js';

const Stats = React.createClass({
    propTypes: {
        questions: PropTypes.array.isRequired,
        currentIndex: PropTypes.number.isRequired,
        dispatch: PropTypes.func.isRequired,
    },
    componentWillMount() {
        this.props.dispatch(getCurrentStats());
    },
    renderQuestionSummary(question) {
        if (!question) {
            return <div className="col s12 center"><h6>You haven't asked any question's yet!</h6></div>;
        }
        const totalResponses = question.choices.reduce((prev, { userAnswers }) => prev + userAnswers.length, 0);
        return (
            <div>
                <h4>{question.prompt}</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Choice</th>
                            <th># of Responses</th>
                            <th>% of Responses</th>
                        </tr>
                    </thead>
                    <tbody>
                    {question.choices.map(({ value, userAnswers }, idx) => (
                        <tr key={`choice${idx}`}>
                            <td>{value}</td>
                            <td>{userAnswers.length}</td>
                            <td>{userAnswers.length / totalResponses * 100 || 0}%</td>
                        </tr>
                        )
                    )}
                    </tbody>
                </table>
                <h5>Total: {totalResponses}</h5>
            </div>
            );
    },
    render() {
        const { questions, dispatch, currentIndex } = this.props;
        const showPrevious = currentIndex > 0;
        const showNext = currentIndex < questions.length - 1;
        return (
            <div>
                <div className="row">
                </div>
                <div className="row">
                    {this.renderQuestionSummary(questions[currentIndex])}
                </div>
                <div className="row">
                    { showPrevious ?
                        <div className="col s1" onClick={() => dispatch(previousStat())}>
                            <PreviousIcon/>
                        </div>
                        : null
                    }
                    <div className="col s10">
                        &nbsp;
                    </div>
                    { showNext ?
                        <div className="col s1" onClick={() => dispatch(nextStat())} >
                            <NextIcon />
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    },
});

export default connect(s => s.stats)(Stats);
