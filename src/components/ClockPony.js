
import Pony from './Pony'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

class ClockPony extends Pony {
    constructor(props){
      super(props);
      this.formatString = "MMM Do h:mm A [EST]";
      this.state = {
        curTime:  moment().format(this.formatString || '')
      }
    }
  
    componentDidMount() {
      this.clockInterval = setInterval(() => {
        this.setState({
          curTime: moment().format(this.formatString || '')
        })
      }, 1000)
    }
  
    componentWillUnmount() {
      clearInterval(this.clockInterval);
    }
  
    render(){
      return (
          <span className="clock"><FontAwesomeIcon icon={faClock} transform="shrink-3" /> {this.state.curTime}</span>
      );
    }
  }

export default ClockPony;

