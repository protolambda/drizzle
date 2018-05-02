import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './rootSaga'
import reducer from './reducer'

function generateStore(options) {
  // Redux DevTools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  // create the saga middleware
  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(
        sagaMiddleware
      )
    )
  )

  sagaMiddleware.run(rootSaga)

  return store
}

module.exports = generateStore