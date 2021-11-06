const { Random } = require("random-js");
const random = new Random(); // uses the nativeMath engine

const jojobane =            require('../assets/sfx/jojobane.mp3').default;
const DP_08 =               require('../assets/sfx/DP_08.mp3').default;
const DP_14 =               require('../assets/sfx/DP_14.mp3').default;
const kirbStarRide =        require('../assets/sfx/kirbStarRide.mp3').default;
const Newtype1 =            require('../assets/sfx/Newtype1.mp3').default;
const profiling =           require('../assets/sfx/profiling.mp3').default;
const Votoms =              require('../assets/sfx/Votoms.mp3').default;
const ZakuEye =             require('../assets/sfx/ZakuEye.mp3').default;
const PW1Save =             require('../assets/sfx/PW1Save.mp3').default;
const PW2Save =             require('../assets/sfx/PW2Save.mp3').default;
const PW3Save =             require('../assets/sfx/PW3Save.mp3').default;
const SunsetRiders =        require('../assets/sfx/SunsetRiders.mp3').default;
const KonamiLogo =          require('../assets/sfx/KonamiLogo.mp3').default;
const Gunbuster =           require('../assets/sfx/GunbusterEyecatch.mp3').default;
const GGundamEpCard =       require('../assets/sfx/GGundamEpCard.mp3').default;
const CapcomLogo =          require('../assets/sfx/CapcomLogo.mp3').default;
const KatamariFanfare =     require('../assets/sfx/KatamariFanfare.mp3').default;
const GTJingle =            require('../assets/sfx/GTJingle.mp3').default;
const alucardLevel =        require('../assets/sfx/alucardLevel.mp3').default;
const goofTroop =           require('../assets/sfx/gooftroopSuite.mp3').default;
const ps1 =                 require('../assets/sfx/ps1.mp3').default;
const neogeo =              require('../assets/sfx/neogeo.mp3').default;
const dreamcast =           require('../assets/sfx/dreamcast.mp3').default;

const colossus =            require('../assets/sfx/alerts/colossus.mp3').default;
const getReady =            require('../assets/sfx/alerts/getready.mp3').default;
const bullseye =            require('../assets/sfx/alerts/bullseye.mp3').default;
const interested =          require('../assets/sfx/alerts/interested.mp3').default;
const sigma =               require('../assets/sfx/alerts/sigma.mp3').default;
const cormano =             require('../assets/sfx/alerts/cormano.mp3').default;
const wanana =              require('../assets/sfx/alerts/wanana.mp3').default;
const iloveit =              require('../assets/sfx/alerts/iloveit.mp3').default;

console.log(colossus);

let audios = [
    new Audio(jojobane),
    new Audio(DP_08),
    new Audio(DP_14),
    new Audio(kirbStarRide),
    new Audio(Newtype1),
    new Audio(profiling),
    new Audio(Votoms),
    new Audio(ZakuEye),
    new Audio(PW1Save),
    new Audio(PW2Save),
    new Audio(PW3Save),
    new Audio(SunsetRiders),
    new Audio(KonamiLogo),
    new Audio(Gunbuster),
    new Audio(GGundamEpCard),
    new Audio(CapcomLogo),
    new Audio(KatamariFanfare),
    new Audio(GTJingle),
    new Audio(alucardLevel),
    new Audio(goofTroop),
    new Audio(dreamcast),
    new Audio(ps1),
    new Audio(neogeo),
];

let redeems = {
    'getReady': getReady,
    'cormano': cormano,
    'bullseye': bullseye,
    'sigma': sigma,
    'wanana': wanana,
    'interested': interested,
    'iloveit': iloveit
}

let bin = [];

function playAlertSound() {
    let index = random.integer(0, audios.length-1);
    let audio1 = audios[index];
    audios.splice(index, 1);
    bin.push(audio1);
    audio1.crossOrigin = "anonymous";
    audio1.play();
    console.log("audio call");
    if (audios.length === 0) {
        audios = bin;
        bin = [];
    }
}

function playColossus() {
    new Audio(colossus).play();
    if (random.bool()) {
        setTimeout(playColossus, random.integer(500, 2000));
    }
}

function playRedeem(key) {
    new Audio(redeems[key]).play();

}

export default {playAlertSound, playColossus, playRedeem};