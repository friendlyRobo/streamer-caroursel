const { Random } = require("random-js");
const random = new Random(); // uses the nativeMath engine
const _ = require('lodash');

// TODO Figure out if FQDN is required for this get
const alertBaseURL = "http://localhost:9050/alerts/";
let alertList = [];

const getReady =            require('../assets/sfx/alerts/getready.mp3').default;
const bullseye =            require('../assets/sfx/alerts/bullseye.mp3').default;
const interested =          require('../assets/sfx/alerts/interested.mp3').default;
const sigma =               require('../assets/sfx/alerts/sigma.mp3').default;
const cormano =             require('../assets/sfx/alerts/cormano.mp3').default;
const wanana =              require('../assets/sfx/alerts/wanana.mp3').default;
const iloveit =             require('../assets/sfx/alerts/iloveit.mp3').default;
const goodluck =            require('../assets/sfx/alerts/goodluck.mp3').default;
const ohno =                require('../assets/sfx/alerts/ohno.mp3').default;

const colossus =            require('../assets/sfx/alerts/colossus.mp3').default;

let redeems = {
    'getReady': getReady,
    'cormano': cormano,
    'bullseye': bullseye,
    'sigma': sigma,
    'wanana': wanana,
    'interested': interested,
    'iloveit': iloveit,
    'goodluck': goodluck,
    'ohno': ohno
}

let audios = [];
let bin = [];

function playAlertSound() {
    let index = random.integer(0, audios.length-1);
    let audio1 = audios[index];
    audios.splice(index, 1);
    bin.push(audio1);

    new Audio(alertBaseURL + audio1 + ".mp3").play();

    console.log("audio call");
    if (audios.length === 0) {
        audios = bin;
        bin = [];
    }
}

// TODO Count the amount of times Collosus yells
// Return a promise the resolves with that number
function playColossus() {
    new Audio(colossus).play();
    if (random.bool()) {
        setTimeout(playColossus, random.integer(500, 2000));
    }
}

function playRedeem(key) {
    new Audio(redeems[key]).play();

}

function updateAlertList(newAlertList){
    if(!_.isEqual(newAlertList, alertList)) {
        alertList = newAlertList;
        audios = alertList.slice();
    }
}

export default {playAlertSound, playColossus, playRedeem, updateAlertList};