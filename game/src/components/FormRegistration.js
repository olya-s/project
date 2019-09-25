import React from 'react';
import '../App.css';

import {Redirect} from 'react-router-dom';

import {connect} from 'react-redux';
import { useState } from 'react';

import register from '../actions/register';

import {mapStateToPropsLogin} from '../store';

let FormRegistration = p => {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [checkPassword, setCheckPassword] = useState('');
  let [valid, setValid] = useState(true);

  function changeHandler(e){
    const pas = e.target.value;
    setPassword(pas);
    setValid((checkPassword === '') ? (pas.length > 2) : validation(pas, checkPassword));
  }

  function changeHandler2(e){
    const checkPas = e.target.value;
    setCheckPassword(checkPas);
    setValid(validation(password, checkPas));
  }

  function validation(v1, v2){
    return (v1 === v2);
  }
  return (
    !p.authToken ?
    <div className="container">
      <form className="form-horizontal">
        <div className="form-group row">
          <label htmlFor="inputUsername" className="col-sm-3 col-form-label">Username</label>
          <div className="col-sm-7">
            <input type="text" className="form-control" id="inputUsername" value={username}
              placeholder="login" onChange={e => setUsername(e.target.value)}
              style={{borderColor: p.login && p.login.error ? 'red' : ''}} autoFocus/>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputPassword" className="col-sm-3 col-form-label">Password</label>
          <div className="col-sm-7">
            <input type="password" className="form-control" id="inputPassword" value={password}
              placeholder="password" onChange={changeHandler}
              style={{borderColor: valid ? '' : 'red'}}/>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputCheckPassword" className="col-sm-3 col-form-label">Check password</label>
          <div className="col-sm-7">
            <input type="password" className="form-control" id="inputCheckPassword" value={checkPassword}
              placeholder="check password" onChange={changeHandler2}
              style={{borderColor: valid ? '' : 'red'}}
              onKeyPress={evt => {
                if(evt.charCode === 13){
                  register(username, password)
                }}
              }/>
          </div>
        </div>
      </form>
      {p.login && p.login.error && <p style={{fontSize: 16+'px', color: 'red'}}>{p.login.error}</p>}
      <button type="button" className="btn btn-primary" onClick={() => validation(password, checkPassword) && register(username, password)}
        disabled={!(username && password && checkPassword)}>Регистрация</button>
    </div> :
    <Redirect to="/" />
  ) 
}
FormRegistration = connect(mapStateToPropsLogin)(FormRegistration);

export default FormRegistration;