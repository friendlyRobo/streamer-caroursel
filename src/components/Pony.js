import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Change this into a functional Component instead
class Pony extends Component {
    render() {
      return (<span><FontAwesomeIcon icon={this.props.icon}  transform="shrink-3" /> {this.props.textValue}</span>)
    }
}

export default Pony;
