import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { login } from 'app/actions';

const Login = React.createClass({

    propTypes: {
        dispatch: PropTypes.func.isRequired,
        errorMessage: PropTypes.string,
        loading: PropTypes.bool.isRequired,
    },
    getInitialState() {
        return {
            username: '',
            password: '',
        };
    },
    render() {
        const dispatch = this.props.dispatch;
        const error = this.props.errorMessage ? (
            <div className="card-panel red  darken-2 center">
                <span className="white-text">{this.props.errorMessage}</span>
            </div>
        ) : null;
        return (
            <div className="login-form">
                <div className="row">
                    <div className="col s12 m6">
                        <label htmlFor="username">Username</label>
                        <input
                          id="username"
                          onChange={({ target: { value } }) => this.setState(state => state.username = value)}
                          type="text"
                          value={this.state.username}
                        />
                    </div>
                    <div className="col s12 m6">
                        <label htmlFor="password">Password (Careful, stored in plaintext...)</label>
                        <input
                          id="password"
                          onChange={({ target: { value } }) => this.setState(state => state.password = value)}
                          type="password"
                          value={this.state.password}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col s2 offset-s5 offset-m5 m4">
                        <span
                          className={cn('btn', { disabled: this.props.loading || !this.state.username || !this.state.password })}
                          onClick={ () => dispatch(login(this.state.username, this.state.password)) }
                        >Login!</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col s12">
                        {error}
                    </div>
                </div>
            </div>
        );
    },
});

export default connect(i => i.loginForm)(Login);
