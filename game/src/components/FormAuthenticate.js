import React from 'react';
import '../App.css';

import {Link, Redirect} from 'react-router-dom';

import {connect} from 'react-redux';
import { useState } from 'react';

import authenticate from '../actions/authenticate';

import {mapStateToPropsLogin} from '../store';

let FormAuthenticate = p => {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  return (
    !p.authToken ? 
    <div className="container">
    <form className="form-horizontal">
      <div className="form-group row">
        <label htmlFor="inputUsername" className="col-sm-2 col-form-label">Username</label>
        <div className="col-sm-7">
          <input type="text" className="form-control" id="inputUsername" value={username}
            placeholder="login" onChange={e => setUsername(e.target.value)}
            style={{borderColor: p.login && p.login.error ? 'red' : ''}} autoFocus/>
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="inputPassword" className="col-sm-2 col-form-label">Password</label>
        <div className="col-sm-7">
          <input type="password" className="form-control" id="inputPassword" value={password}
            placeholder="password" onChange={e => setPassword(e.target.value)}
            style={{borderColor: p.login && p.login.error ? 'red' : ''}}
            onKeyPress={evt => {
              if(evt.charCode === 13){
                authenticate(username, password)
              }}
            }/>
        </div>
      </div>
      {p.login && p.login.error && <p style={{fontSize: 16+'px', color: 'red'}}>{p.login.error}</p>
    }
      <button type="button" id="save" className="btn btn-primary" onClick={() => {authenticate(username, password)
      }}
        disabled={!(username && password)}>Вход</button>
        <div>
          <span>Ещё не зарегистрированы? </span>
          <Link to="/registration">Регистрация</Link>
        </div>
    </form>
    </div> :
    <Redirect to="/" />
  )  
}
FormAuthenticate = connect(mapStateToPropsLogin)(FormAuthenticate);

export default FormAuthenticate;