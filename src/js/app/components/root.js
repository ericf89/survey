import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Pizza from 'app/components/svgs/pizza';
const RootComponent = ({ children, username }) => (
<div className="container">
        <div className="header row card orange darken-2 white-text center">
            <div className="col s8 m3 logo">
                <Link className="white-text" to="/"><h5><Pizza/>Pizza&nbsp;Survey!</h5></Link>
            </div>
            <div className="col s2 offset-m6 m3">
            { username ?
                <Link activeClassName="disabled" className="white-text btn" to="/dashboard">Dashboard</Link> :
                <Link activeClassName="disabled" className="white-text btn" to="/login">Login</Link>
            }
            </div>
        </div>
    { children }
</div>
);

export default connect(({ username }) => ({ username }))(RootComponent);
