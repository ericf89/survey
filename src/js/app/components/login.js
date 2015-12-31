import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { login, register } from 'app/actions';

const Login = React.createClass({

    propTypes: {
        dispatch: PropTypes.func.isRequired,
        errorMessage: PropTypes.string,
        infoMessage: PropTypes.string,
        loading: PropTypes.bool.isRequired,
    },
    getInitialState() {
        return {
            username: '',
            password: '',
        };
    },
    render() {
        const { dispatch, errorMessage, infoMessage } = this.props;
        const error = errorMessage ? (
            <div className="card-panel red  darken-2 center">
                <span className="white-text">{errorMessage}</span>
            </div>
        ) : null;
        const info = infoMessage ? (
            <div style={{ backgroundColor: '#F9C80E' }} className="card-panel center z-depth-0">
                <span className="">{infoMessage}</span>
            </div>
        ) : null;
        const disabled = this.props.loading || !this.state.username || !this.state.password;
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
                    <div className="col s12 center">
                        <span
                          className={cn('btn', { disabled, tertiary: info })}
                          onClick={ () => dispatch(login(this.state.username, this.state.password)) }
                        >
                            Login!
                        </span>
                    </div>
                </div>
                <div className="row">
                    <div className="col s12 center">
                        {info ?
                            <span
                              className={cn('btn z-depth-3', { disabled })}
                              onClick={ () => dispatch(register(this.state.username, this.state.password)) }
                            >
                                Register!
                            </span>
                        : null }
                    </div>
                </div>
                <div className="row">
                    <div className="col s12">
                        {error}
                    </div>
                    <div className="col s12">
                        {info}
                    </div>
                </div>
            </div>
        );
    },
});

export default connect(i => i.loginForm)(Login);
