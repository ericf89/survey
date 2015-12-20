import { createStore as baseCreateStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'app/reducers';
import DevTools from 'app/components/DevTools';

const finalCreateStore = compose(
  applyMiddleware(thunk),
  DevTools.instrument()
)(baseCreateStore);

export default function createStore(initialState) {
    return finalCreateStore(rootReducer, initialState);
}
