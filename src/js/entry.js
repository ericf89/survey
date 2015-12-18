import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { syncReduxAndRouter } from 'redux-simple-router';
import createStore from 'app/store';
import { Router } from 'react-router';
import routes from 'app/routes';
import DevTools from 'app/components/devtools';
import createHistory from 'history/lib/createBrowserHistory';
const history = createHistory();
const store = createStore(window.INITIAL_APP_STATE);

syncReduxAndRouter(history, store);
ReactDOM.render((
    <div>
        <Provider store={store}>
            <div>
                <Router history={history}>
                    {routes}
                </Router>
                <DevTools />
            </div>
        </Provider>
    </div>
    ), document.getElementById('app'));
