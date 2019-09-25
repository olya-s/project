import promiseActionsMaker from './promiseActionsMaker';
import {store, gql} from '../store';

export default function startGameThunk(lat, lng){
  let startGame = promiseActionsMaker('START_GAME',
    gql.request(`
      mutation startGame($lat: Float!, $lng: Float!){
        startGame(lat: $lat, lng: $lng){
          id, lat, lng, usersCount,
          checkpoints {id, lat, lng, weight},
          userlogs {id, lat, lng, weight, user {id, username}, team {id, title}},
          users {id, username}
        }
      }
    `, {lat, lng}, {context: store.getState().auth.token})
  );
  return startGame();
}