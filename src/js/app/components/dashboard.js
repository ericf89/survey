import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from 'app/actions';
import { replacePath } from 'redux-simple-router';

const Dashboard = React.createClass({
    displayName: 'dashboard',
    propTypes: {
        children: PropTypes.object,
        username: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
    },
    componentDidMount() {
        const { username, dispatch } = this.props;
        if (!username) dispatch(replacePath('/login'));
    },
    render() {
        const { username, dispatch } = this.props;
        return (
            <div>
                <div className="row">
                    <Link
                      className="black-text col s5 offset-s2 card-panel center z-depth-1"
                      activeClassName="z-depth-3 white-text orange"
                      to="/dashboard/stats"
                    >
                        <h5>Stats</h5>
                    </Link>
                    <div className="col s2">&nbsp;</div>
                    <Link
                      className="black-text col s5 card-panel center z-depth-1"
                      activeClassName="z-depth-3 white-text orange"
                      to="/dashboard/new-question"
                    >
                        <h5>New Question</h5>
                    </Link>
                </div>
                {this.props.children ||
                    <div className="row center">
                        <h5 className="col s12"> Welcome{username ? ' ' + username : null}! </h5>
                        <p>Be sure to drink your Ovaltine! </p>
                    </div>
                }
                {!this.props.children && username ?
                    <div className="row center">
                        <h6 className="col s12">Or... <a href="#" onClick={() => dispatch(logout())}>logout.</a> :(</h6>
                    </div>
                : null }
            </div>
        );
    },
});

export default connect(({ username }) => ({ username }))(Dashboard);
