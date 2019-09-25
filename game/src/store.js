import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import { GraphQLClient } from 'graphql-request';

const gql = new GraphQLClient('graphql', { headers: {} })

var jwtDecode = require('jwt-decode');

function authReducer(state, action){
  function createStateFromToken(token){
    gql.options.headers = {'Authorization': 'Bearer ' + token};
    return {
      token: token,
      sub: token && jwtDecode(token),
      login: [action.data][0],
    }
  }
  if (!state){
    return createStateFromToken(localStorage.authToken);
  }
  const { type } = action;
  if (type === 'LOGIN'){
    if(action.token){
      localStorage.authToken = action.token;
    }
    gql.options.headers = {'Authorization': 'Bearer ' + localStorage.authToken};
    return createStateFromToken(localStorage.authToken);
  }
  if (type === 'LOGOUT'){
    delete localStorage.authToken;
    gql.options.headers = {};
    return createStateFromToken(localStorage.authToken)
  }
  return state;
}

function promiseReducer(state, action){  
  if(!state){
    return {}
  }
  if(action.type === 'PROMISE'){
    return {...state, [action.name]: action.payload}
  }
  return state
}

const reducers = combineReducers({
  auth: authReducer,
  promise: promiseReducer
})

const store = createStore(reducers, applyMiddleware(thunk));

let mapStateToProps = st => ({
  authToken: st.auth.token,
  name: st.auth.sub && st.auth.sub.name,
  inform: st.promise.INFORM && st.promise.INFORM.information,
  game: st.promise.START_GAME && st.promise.START_GAME.startGame,
})

let mapStateToPropsLogin = st => ({
  authToken: st.auth.token,
  login: st.auth.login
})

export {store, gql, mapStateToProps, mapStateToPropsLogin};