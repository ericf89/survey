import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import RootComponent from 'app/components/root';
import Home from 'app/components/home';
import Dashboard from 'app/components/dashboard';
import QuestionForm from 'app/components/questionForm';
import Stats from 'app/components/stats';

export default (
    <Route path="/" component={RootComponent}>
        <IndexRoute component={Home} />
        <Route name="dashboard" path="dashboard" component={Dashboard}>
            <Route name="newQuestion" path="new-question" component={QuestionForm}/>
            <Route name="stats" path="stats" component={Stats}/>
        </Route>
        <Redirect from="*" to="/"/>
    </Route>
);
