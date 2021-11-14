import React from 'react';
import Carousel from './Carousel';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fab, fas);

function App() {
  return (
    <div><Carousel /></div>
  );
}

export default App;
