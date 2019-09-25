import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Provider} from 'react-redux';
import {store} from './store';

import Content from './components/Content';

store.subscribe(() => console.log("store",store.getState()));

function App() {
  return (
    <div className = "App">
      <Provider store = {store}>
        <Content />
      </Provider>
    </div>
  );
}

export default App;