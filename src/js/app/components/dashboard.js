import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const Dashboard = React.createClass({
    displayName: 'dashboard',
    propTypes: {
        children: PropTypes.object.isRequired,
    },
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    },
});

export default connect(i => i)(Dashboard);
