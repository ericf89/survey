import { createStore as baseCreateStore, compose } from 'redux';
import rootReducer from 'app/reducers';
import DevTools from 'app/components/DevTools';

const finalCreateStore = compose(
  // applyMiddleware(d1, d2, d3),
  DevTools.instrument()
)(baseCreateStore);

export default function createStore(initialState) {
    return finalCreateStore(rootReducer, initialState);
}
