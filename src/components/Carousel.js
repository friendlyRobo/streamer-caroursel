import React from "react";
import socketIOClient from "socket.io-client";
import { faGamepad, faMusic, faQuestionCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import audioPlayer from '../services/audioPlayer';
import './Carousel.css';
import Pony from './Pony'
import ClockPony from './ClockPony'

let baseUrl;
console.log(process.env.NODE_ENV);
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  // dev code
  baseUrl = 'http://localhost:3000';
} else {
  // production code
  baseUrl = 'http://localhost:9050';
}

class Carosel extends React.Component {
  constructor(props){
    console.log('struct');
    super(props);
    this.state = { animationState: "fadeIn", alertAnimationState: "non" };
    this.ponies = [];
    this.alerts = [];
    this.alertInterval = 0;
    this.boxIterator = 0;


    this.getActivePony = () => {
      if (!this.ponies[this.boxIterator]) return;

      return this.ponies[this.boxIterator]();
    };

    this.handleAlert = (alertText) => {
      this.alerts.push(alertText);
      if (this.alertInterval !== 0) {
        return;
      }

      this.setState({ dropState: "dropOut", alertAnimationState: "slideIn", followText: this.alerts.shift() });
      audioPlayer.playAlertSound();
      this.alertInterval = setInterval(() => {
        if (this.alerts.length) {
          let nextAlert = this.alerts.shift();
          this.setState({alertAnimationState: "slideOut"});
          setTimeout(() => {
            this.setState({alertAnimationState: "slideIn", followText: nextAlert});
            audioPlayer.playAlertSound();
          }, 1000)
        } else {
          this.setState({alertAnimationState: "slideOut", dropState: "dropIn", });
          clearInterval(this.alertInterval);
          this.alertInterval = 0;
        }
      }, 1000 * 10)

    }

    this.doMagfest = () => {
        audioPlayer.playColossus();
    }
  }

  componentDidMount() {
    console.log("mounted");
    this.fadeInterval = setInterval(() => {
      this.setState({ animationState: "fadeOut" });
      setTimeout(()=> {
        this.boxIterator++;

        if (this.boxIterator > this.ponies.length-1) {
          this.boxIterator = 0;
        }
        this.setState({ animationState: "fadeIn" });
      }, 1000);
    }, 10 * 1000); 

    // TODO Convert to EventSource, Socket is overkill for one-way data
    const socket = socketIOClient(baseUrl);
    socket.on("DATAUPDATE", oData => {
      if (!oData.length) {
        return;
      }
      let data = JSON.parse(oData)

      this.ponies = [];
      this.boxIterator = 0;

      this.ponies.push(() => <Pony textValue={data.twitter} icon={faTwitter} />);
      this.ponies.push(() => <Pony textValue={data.nowPlaying} icon={faGamepad} />);
      this.ponies.push(() => <Pony textValue={data.info} icon={faQuestionCircle} />);

      if (data.showMusic) {
        this.ponies.push(() => <Pony textValue={this.state.currentSong}  icon={faMusic} />);
      }
      if (data.showClock) {
          this.ponies.push(() => <ClockPony/>);
      }
    });

    socket.on("NEWSONG", data => {
      if (this.state.currentSong !== data) this.setState({ currentSong: data });
    });

    socket.on("ALERT", data => {
      this.handleAlert(data.textString);
    });

    socket.on("MAGFEST", data => {
      this.doMagfest();
    });

    socket.on("SOUNDREDEEM", data => {
      audioPlayer.playRedeem(data.soundKey);
    })
  }

  componentWillUnmount() {
    clearInterval(this.fadeInterval);
  }

  render() {
    return (
      <div>
        <div className={"ponyWrapper " + this.state.dropState}><div className={"pony " + this.state.animationState}>{this.getActivePony()}</div></div>
        <div className={"alart " + this.state.alertAnimationState}><Pony textValue={this.state.followText} icon={faCog} /></div>
      </div>
    );
  }
}

export default Carosel;
