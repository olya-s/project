import {store} from '../store';

export default function register(username, password){
  fetch('/register', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({username, password})
    })
  .then(res => res.json())
  .then(data => store.dispatch({type: 'LOGIN', token: data.token, data}))
}