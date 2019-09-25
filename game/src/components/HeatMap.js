/*global google*/
import React from 'react';
import '../App.css';

import updateGame from '../actions/updateGame';

import {connect} from 'react-redux';

class HeatMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {status: 'awaiting players...'};
    this.center = this.props.center;
    this.gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ];
    this.heatMap = false;
    this.usersMarkers = [];
    this.updateMap = this.updateMap.bind(this);
    this.getMyPosition = this.getMyPosition.bind(this);
  }
  updateMap(props){
    this.status = props.status;
    if(this.status === 'current'){
      this.setState({status: ''});
    }
    else if(this.status === 'ended'){
      this.setState({status: 'GAME OVER'});
      return;
    }
    this.heatmapData1 = [];
    this.heatmapData2 = [];
    this.heatmapData3 = [];
    this.heatmapData4 = [];
    props.checkpoints.forEach((point, i) => 
      new google.maps.Marker({
        position: {lat: point.lat, lng: point.lng},
        map: this.map,
        icon: {
          url: require('../images/flagMarker.png'),
          size: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(10, 26)
        },
        title: `base ${i}, weight: ${point.weight}`,
      })
    );
    props.userlogs.forEach(log => {
      if(log.user.id === this.props.sub.sub){
        this.team = log.team.title;
      }
    });
    this.players = props.userlogs.filter(log => {
      return this.team === log.team.title;
    });
    this.players.forEach((p, i) => {
      if(!this.usersMarkers[i]){
        this.usersMarkers.push(
          new google.maps.Marker({
            position: {lat: p.lat, lng: p.lng},
            map: this.map,
            icon: {
              url: require('../images/userMarker.png'),
              size: new google.maps.Size(16, 16),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(8, 8),
            },
            title: `${p.user.username} health: ${p.weight}`,
          })
        )
      }
      else{
        this.usersMarkers[i].setPosition({lat: p.lat, lng: p.lng});
        this.usersMarkers[i].setTitle(`${p.user.username} ${p.weight}`);
      }
    });
    for(let i = 0; i < props.checkpoints.length / 2; i++){
      let point = props.checkpoints[i];
      this.heatmapData1.push({
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: point.weight
      });
    }
    for(let i = props.checkpoints.length / 2; i < props.checkpoints.length; i++){
      let point = props.checkpoints[i];
      this.heatmapData2.push({
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: point.weight
      });
    }
    this.players.forEach(p => {
      this.heatmapData3.push({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.weight,
      })
    })
    if(this.pointArray1){
      this.pointArray1.clear();
      this.heatmapData1.forEach(point => this.pointArray1.push(point));
    }
    else{
      this.pointArray1 = new google.maps.MVCArray(this.heatmapData1);
      this.heatmap1 = new google.maps.visualization.HeatmapLayer({
        data: this.pointArray1
      });
    }
    if(this.pointArray2){
      this.pointArray2.clear();
      this.heatmapData2.forEach(point => this.pointArray2.push(point));
    }
    else{
      this.pointArray2 = new google.maps.MVCArray(this.heatmapData2);
      this.heatmap2 = new google.maps.visualization.HeatmapLayer({
        data: this.pointArray2
      });
    }
    if(this.pointArray3){
      this.pointArray3.clear();
      this.heatmapData3.forEach(point => this.pointArray3.push(point));
    }
    else{
      this.pointArray3 = new google.maps.MVCArray(this.heatmapData3);
      this.heatmap3 = new google.maps.visualization.HeatmapLayer({
        data: this.pointArray3
      });
    }
    if(!this.heatMap){
      this.heatmap1.set('radius', 70);
      this.heatmap1.setMap(this.map);
      this.heatmap2.set('gradient', this.gradient);
      this.heatmap2.set('radius', 70);
      this.heatmap2.setMap(this.map);
      if(this.team === 'friends'){
        this.heatmap3.set('radius', 20);
        this.heatmap3.setMap(this.map);
      }
      if(this.team === 'enemies'){
        this.heatmap3.set('gradient', this.gradient);
        this.heatmap3.set('radius', 20);
        this.heatmap3.setMap(this.map);
      }
    }
  }

  getMyPosition(){
    navigator.geolocation.getCurrentPosition((position)=> {
      this.myPosition = {lat: position.coords.latitude, lng: position.coords.longitude}
    });
  }

  componentDidMount(){
    this.getMyPosition();
    this.map = new window.google.maps.Map(document.getElementById('map'), {
      center: this.props.center,
      zoom: 15
    });
    this.updateMap(this.props);
    this.heatMap = true;

      // function getCoefficient(pnt, points1, points2) {
      //   let lat = pnt.lat();
      //   // lat = lat.toFixed(4);
      //   let lng = pnt.lng();
      //   // lng = lng.toFixed(4);
      //   let pos = {lat, lng};
      //   // console.log("Latitude: " + lat + "  Longitude: " + lng);
      //   //back: вычисление коэффициента + рассчет веса точек и юзера -> передача на фронт
      //   let k = 1, distances = [];
      //   for(let point of points1){
      //     let distance = google.maps.geometry.spherical.computeDistanceBetween(pnt, point.location);
      //     k += 1 / distance * point.weight;
      //     distances.push(distance);
      //   }
      //   for(let point of points2){
      //     let distance = google.maps.geometry.spherical.computeDistanceBetween(pnt, point.location);
      //     k = 1 / distance * point.weight;
      //     distances.push(distance);
      //   }
      //   return {k, distances};
      // }
      // function distance(pos, points) {
      //   let lat1 = pos.lat;
      //   let lon1 = pos.lng;
      //   let distances = [];
      //   var p = Math.PI / 180;//0.017453292519943295;    // Math.PI / 180
      //   var c = Math.cos;
      //   points.forEach(point => {
      //     let lat2 = point.lat;
      //     let lon2 = point.lng;
      //     let a = 0.5 - c((lat2 - lat1) * p)/2 + 
      //           c(lat1 * p) * c(lat2 * p) * 
      //           (1 - c((lon2 - lon1) * p))/2;
      //     distances.push(12742000 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
      //   })
      //   return distances;
      // }    
      // google.maps.event.addListener(this.map, 'mousemove', event => {
      //   console.log(event.latLng)
      //   // console.log(getCoefficient(event.latLng, this.heatmapData1, this.heatmapData2))
      // });

    google.maps.event.addListener(this.map, 'click', event => {
      this.myPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
      // updateGame(this.myPosition).then(game => {
      //   this.updateMap(game.updateGame);
      // });
    });
    setInterval(async () => {
      // this.getMyPosition();
      // console.log(this.props.authToken, this.props.sub);
      let game = (this.status !== 'ended') && await updateGame(this.myPosition);
        game && this.updateMap(game.updateGame);
    }, 5000);
  }
  render(){
    return (
      <div>
        <div>{this.state.status}</div>
        <div style = {{ height: '80vh', width: '100%' }} id = "map"></div>
      </div>
    )
  }
}
HeatMap = connect(st => ({authToken: st.auth.token, sub: st.auth.sub}))(HeatMap);

export default HeatMap;