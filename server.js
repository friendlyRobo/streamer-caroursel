const express = require("express");
const http = require("http");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const socketIo = require("socket.io");
const socketIOClient = require("socket.io-client");

const tts = require('./src/serverUtils/textToSpeech');
const eventHandler =  require('./src/serverUtils/streamlabsEventHandler');

const port = 9050;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const socketToken = process.env.STREAMLABS;
const streamlabsSocket = socketIOClient(`https://sockets.streamlabs.com?token=${socketToken}`, {transports: ['websocket']});

// Serve the overlay over HTTP
app.use(express.static(path.join(__dirname, 'build')));
app.use('/alerts', express.static(path.join(__dirname, 'sfx')));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// POST methods come from TouchPortal, which ingests CP rewards and passes it via these endpoints
// TODO Replace these methods with Twitch PubSub so anyone could feasibly use this
app.post('/MAGFEST', function (req, res) {
  res.send('POST request to the homepage')
  doMAGFEST();
});

app.post('/soundRedeem', function (req, res) {
  res.send('POST request to the homepage')
  playSoundRedeem(req.headers.soundkey);
});

app.post('/ttsRedeem', function (req, res) {
  res.send('POST request to the homepage')
  ttsRedeem(req.headers.authorization);
});

//TODO Pick up all non-express/socket logic and distribute to other modules

let data, socket, nowPlayingSong;

io.on("connection", (oSocket) => {
  socket = oSocket;
  console.log("New client connected");
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.removeAllListeners();
  });

  updateSong();
  updateData();
});

streamlabsSocket.on('event', (eventData) => {  
  console.log('event came in')
  const returnString = eventHandler(eventData);
  if (returnString) {
    sendAlert(returnString);
  }
});

// Sometimes I want to log Streamlabs data since their API docs don't explain even half their events
// socket.on('event', (logItem) => logStreamLabs(logItem));

function logStreamLabs(event) {
  fs.writeFile(`./logs/${Date.now()}.json`, JSON.stringify(event), function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
}

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

// TODO Take config supplied path to nowplaying.txt
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
