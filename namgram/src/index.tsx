import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { Provider } from 'react-redux'
import { applyMiddleware, createStore, compose } from 'redux'
import thunk from 'redux-thunk'

import { createMuiTheme, ThemeProvider } from '@material-ui/core';

import { rootReducer } from './redux/index'


const composeEnhancers =
//@ts-ignore
  typeof window === "object" && window.REDUX_DEVTOOLS_EXTENSION_COMPOSE
  //@ts-ignore
    ? window.REDUX_DEVTOOLS_EXTENSION_COMPOSE({})
    : compose;
const middleware = [thunk];
const enchancer = composeEnhancers(applyMiddleware(...middleware));
//@ts-ignore
const store = createStore(rootReducer, {ui: {loading: false, error: ""}}, enchancer);

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "rgba(34, 195, 150, 1)",
    },
    primary: {
      main: "rgba(198, 45, 253, 1)",
    },
  },
});
//test
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
