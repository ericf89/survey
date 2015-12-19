import React from 'react';
import { Link } from 'react-router';
import Pizza from 'app/components/svgs/pizza';
export default ({ children }) => (
<div className="container">
    <div className="header row card orange darken-2 white-text center">
        <div className="col s12 m3 logo">
            <Link className="white-text" to="/"><h5><Pizza/>Pizza&nbsp;Survey!</h5></Link>
        </div>
        <div className="col s6 offset-m3 m3">
            <Link activeClassName="disabled" className="white-text btn" to="/dashboard/new-question">New&nbsp;Question</Link>
        </div>
        <div className="col s6 m3">
            <Link activeClassName="disabled" className="white-text btn" to ="/dashboard/stats">Stats</Link>
        </div>
    </div>
    { children }
</div>
);
