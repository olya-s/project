import {store, gql} from '../store';

export default function updateGame({lat, lng}){
    return gql.request(`
      mutation updateGame($lat: Float!, $lng: Float!){
        updateGame(lat: $lat, lng: $lng){
          id, lat, lng, status, usersCount,
          checkpoints {id, lat, lng, weight},
          userlogs {lat, lng, weight, user {id, username}, team {id, title}}     
        }
      }
    `, {lat, lng}, {context: store.getState().auth.token})
}