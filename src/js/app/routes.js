import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Home from 'app/components/home';
import RootComponent from 'app/components/root';

export default (
    <Route name="app" path="/" component={RootComponent}>
        <IndexRoute component={Home} />
    </Route>
);
