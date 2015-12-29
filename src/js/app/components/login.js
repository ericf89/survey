import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { login } from 'app/actions';

const Login = React.createClass({

    propTypes: {
        dispatch: PropTypes.func.isRequired,
    },

    render() {
        const dispatch = this.props.dispatch;
        return (
            <div className="login-form">
                <div className="row">
                    <div className="col s12 m6">
                        <label htmlFor="username">Username</label>
                        <input id="username" ref="username" type="text"/>
                    </div>
                    <div className="col s12 m6">
                        <label htmlFor="password">Password (Careful, stored in plaintext...)</label>
                        <input id="password" ref="password" type="password"/>
                    </div>
                </div>
                <div className="row">
                    <div className="col s12 offset-m5 m4">
                        <span className="btn" onClick={ () => dispatch(login(this.refs.username.value, this.refs.password.value)) }>Login!</span>
                    </div>
                </div>
            </div>
        );
    },
});

export default connect(i => i)(Login);
