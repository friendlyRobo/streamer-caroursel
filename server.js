const express = require("express");
const http = require("http");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const socketIo = require("socket.io");
const socketIOClient = require("socket.io-client");

const tts = require('./src/services/textToSpeech')

const port = 9050;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const socketToken = process.env.STREAMLABS;
const streamlabsSocket = socketIOClient(`https://sockets.streamlabs.com?token=${socketToken}`, {transports: ['websocket']});

// Serve the overlay over HTTP
app.use(express.static(path.join(__dirname, 'build')));
app.use('/alerts', express.static(path.join(__dirname, 'build', 'alerts')));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// POST methods come from TouchPortal, which ingests CP rewards and passes it via these endpoints
app.post('/MAGFEST', function (req, res) {
  res.send('POST request to the homepage')
  doMAGFEST();
});

app.post('/soundRedeem', function (req, res) {
  res.send('POST request to the homepage')
  playSoundRedeem(req.headers.soundkey);
})

app.post('/ttsRedeem', function (req, res) {
  res.send('POST request to the homepage')
  ttsRedeem(req.headers.authorization);
})

let data, socket, nowPlayingSong, lastID;
let gifter = '', 
    giftCounter = 0;

let showFollows = true;
let banList = /hoss00312.*/g;

io.on("connection", (oSocket) => {
  socket = oSocket;
  console.log("New client connected");
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.removeAllListeners();
  });
  
  // Sometimes I want to log Streamlabs data since their API docs don't explain even half their events
  // socket.on('LOGTHIS', (logItem) => logStreamLabs(logItem));

  updateSong();
  updateData();
});

streamlabsSocket.on('event', (eventData) => {  
  console.log('event came in')
  // Sometimes streamlabs double sends events
  if (eventData.message && eventData.message[0] && eventData.message[0].event_id && lastID === eventData.message[0].event_id) {
    return;
  } else if (eventData.message[0]){
    lastID = eventData.message[0].event_id;
  }

  // TODO this is a lot of logic for the server, split it into a function module that just returns false or the text to send
  if (eventData.for === 'twitch_account') {
    let eventType = eventData.type.toLowerCase();
    switch(eventType) {
      case 'follow':
        console.log(showFollows)
        if (eventData.message[0].name.match(banList)) {
          return;
        }
        sendAlert(`${eventData.message[0].name} has just followed!`);
        console.log(eventData.message);
        break;
      case 'subscription':
        if (eventData.message[0].sub_type === 'subgift') {
          // If we have a gifter we want to ignore the sub train in alerts
          if (eventData.message[0].gifter_display_name === gifter && giftCounter > 0) {
            giftCounter--;
            return;
          }
          sendAlert(`${eventData.message[0].display_name} was gifted a sub by ${eventData.message[0].gifter_display_name}!`);
        } else if (eventData.message[0].sub_type === 'resub') {
          sendAlert(`${eventData.message[0].name} has just resubscribed for ${eventData.message[0].months} months!`);
        } else {
          sendAlert(`${eventData.message[0].name} has just subscribed!`);
        }
        console.log(eventData.message);
        break;
      case 'submysterygift':
        if (eventData.message[0].amount > 1) {
          sendAlert(`${eventData.message[0].gifter_display_name} just gifted ${eventData.message[0].amount} subs! Why???`);
          gifter = eventData.message[0].gifter_display_name;
          giftCounter = parseInt(eventData.message[0].amount);
        }
        console.log(eventData.message);
        break; 
      case 'host':
        sendAlert(`${eventData.message[0].name} has hosted with ${eventData.message[0].viewers} viewers!`);
        console.log(eventData.message);
        break;
      case 'raid':
        sendAlert(`${eventData.message[0].name} has raided with ${eventData.message[0].raiders} viewers!`);
        console.log(eventData.message);
        break;
      case 'bits':
        sendAlert(`${eventData.message[0].name} has just thrown ${eventData.message[0].amount} pennies at the maid!`);
        console.log(eventData.message);
        break;
      default:
        console.log(eventData.message);
    }
  }
});


let nowPlayingWatch = fs.watch('./nowPlaying.txt');
let dataFile = fs.watch('./data.json');

dataFile.on('change', () => updateData());
nowPlayingWatch.on('change', () => updateSong());

function updateData() {
  fs.readFile('./data.json', { 'encoding': 'utf-8' }, (err, oData) => {
      data = JSON.parse(JSON.stringify(oData));
      console.log(data);
      if (socket) socket.emit("DATAUPDATE", data);
      console.log(data)
      // TODO I want to ignore follows in case of a bot-raid but this code wasn't working for some reason
      // showFollows = data["showFollows"];
  });
}

// TODO just move this to its own module
function logStreamLabs(event) {
  fs.writeFile(`./logs/${Date.now()}.json`, JSON.stringify(event), function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
}

function updateSong() {
  fs.readFile('./nowPlaying.txt', (err, data) => {
    let np = data.toString();

    if (np === "from ?") {
      nowPlayingSong = "No Music"
    } else if (np !== nowPlayingSong) {
      console.log('updating...')
      nowPlayingSong = np;
    }

    console.log(nowPlayingSong);
    if (socket) {
      socket.emit("NEWSONG", nowPlayingSong);
    }
  });
}

function sendAlert(alertText) {
  socket.emit("ALERT", {
    textString: alertText
  });
}

function doMAGFEST() {
  console.log('go');
  socket.emit("MAGFEST");
}

function playSoundRedeem(key) {
  socket.emit("SOUNDREDEEM", {
    soundKey: key
  });
}

// This is annoying. TTS is either system level or external API, so the overlay can't do it by itself so the server does all the work
function ttsRedeem(line) {
  tts(line)
}

server.listen(port, () => console.log(`Listening on port ${port}`));
