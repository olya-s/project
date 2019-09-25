import React from 'react';
import '../App.css';

import {Redirect} from 'react-router-dom';

import {connect} from 'react-redux';

import Header from './Header';
import HeatMap from './HeatMap';
import {mapStateToProps} from '../store';

let GameOver = () =>
  <div>
    GAME OVER
  </div>

let Match = props => {
    return(
      <div>
        <Header />
        {!props.authToken ?
        <Redirect to = "/login" /> :
        props.game && props.game.id && (props.status === undefined || props.status === 'current') && //<Loading />
        <HeatMap center = {{lat: (props.game.lat), lng: (props.game.lng)}}
          zoom = {15} checkpoints = {props.game.checkpoints} userlogs = {props.game.userlogs}/>
        }
        {
        props.status === 'ended' &&
        <GameOver />}
      </div>
    )
}
Match = connect(mapStateToProps)(Match);

export default Match;