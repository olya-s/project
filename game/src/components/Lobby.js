import React from 'react';
import '../App.css';

import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import getInformationThunk from '../actions/getInformationThunk';
import startGameThunk from '../actions/startGameThunk';

import Header from './Header';
import {mapStateToProps} from '../store';

class Lobby extends React.Component{
  constructor(props){
    super(props);
    this.state = {lat: null, lng: null, inf: null};
  }

  componentDidMount(){
    this.props.getInformationThunk().then(() => this.props.inform && this.setState({inf: Object.entries(this.props.inform)}));
    navigator.geolocation.getCurrentPosition((position)=> {
      this.setState({lat: position.coords.latitude, lng: position.coords.longitude})
    });
  }

  render(){
    return(
      <div className = "container-fluid col justify-content-end" style={{height: 1000+"px"}}>
        <Header />
        <div className="container-fluid row justify-content-center">
          <div className="col-12 col-md-6">
            {this.state.inf ?
              /*this.state.inf.map(i =>
                <InformItem>
                  <div class = "col-6">{i[0]}</div>
                  <div class = "col-6">{i[1]}</div>
                </InformItem>) :
              <p>Loading...</p>*/
            <table className="table">
              <thead>
                <tr className="row">
                  <th className="col-12">Статистика</th>
                </tr>
              </thead>
              <tbody>
              {this.state.inf.map(i =>
                  <tr className="row"  key={i}>
                    <td className="col-8 text-left">{i[0]}</td>
                    <td className="col-4 text-left">{i[1]}</td>
                  </tr>
              )}
              </tbody>
            </table> :
            <p>Loading...</p>
            }      
          </div>
          <div className="col-12 col-md-6">
            <Link to={!this.props.authToken ? "/login" : "/match"}
              onClick={() => (this.props.authToken && this.props.startGameThunk(this.state.lat, this.state.lng))}>
              <button className="btn btn-primary btn-lg">Играть</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
Lobby = connect(mapStateToProps, {getInformationThunk, startGameThunk})(Lobby);

export default Lobby;