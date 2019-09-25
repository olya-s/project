import React from 'react';
import '../App.css';

import {Router, Route, Switch} from 'react-router-dom';
import createHistory from "history/createBrowserHistory";

import getInformationThunk from '../actions/getInformationThunk';
import startGameThunk from '../actions/startGameThunk';

import Lobby from './Lobby';
import FormAuthenticate from './FormAuthenticate';
import FormRegistration from './FormRegistration';
import Match from './Match';
import Loading from './Loading';

let Content = p => {
  return(
    <Router history = {createHistory()}>
      <Route path = "/" component = { Lobby } getInformationThunk = { getInformationThunk }
        startGameThunk = { startGameThunk } exact/>
      <Switch>
        <Route path = "/login" component = { FormAuthenticate } exact/>
        <Route path = "/registration" component = { FormRegistration } exact/>
        <Route path = "/match" component = { Match } exact/>
        <Route path = "/loading" component = { Loading } exact/>
      </Switch>
    </Router>
  )
}

export default Content;