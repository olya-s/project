import React from 'react';
import '../App.css';

import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import {store, mapStateToProps} from '../store';

class Header extends React.Component{
  render(){
    return(
      <div className="container container-fluid row justify-content-end">      
        {this.props.name &&
        <p className="col-3">{this.props.name}</p>}
        {!this.props.authToken ?
        <div className="row justify-content-around">
          <div className="col-4">
            <Link to="/login"><button className="btn btn-primary">Вход</button></Link>
          </div>
          <div className="col-4">
            <Link to="/registration"><button className="btn btn-primary">Регистрация</button></Link>
          </div>
        </div> : 
        <div className="col-3">
          <Link to="/" onClick={() => store.dispatch({type: 'LOGOUT'})}><button className="btn btn-primary">Выход</button></Link>
        </div>}
      </div>
    )
  }
}
Header = connect(mapStateToProps)(Header);

export default Header;