import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class Pony extends Component {
    render() {
      return (<span><FontAwesomeIcon icon={this.props.icon}  transform="shrink-3" /> {this.props.textValue}</span>)
    }
}

export default Pony;
