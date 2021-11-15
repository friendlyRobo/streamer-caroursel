const childProcess = require('child_process');

class TTS {
    constructor(channel, speed) {
        this.speed = speed;
        this.channel = channel;
        this.baseCommand = "$speak = New-Object -ComObject SAPI.SPVoice; $speak.Voice = $speak.GetVoices().Item(2);"
    }
    speak(text){
        var command = this.baseCommand +
            `$speak.AudioOutput = foreach ($o in $speak.GetAudioOutputs()) {if ($o.getDescription() -eq '${this.channel}') {$o; break;}}; `
            + "$speak.Speak([Console]::In.ReadToEnd());"

        this.child = childProcess.spawn('powershell', [command], {shell: true})
        this.child.stdin.setEncoding('ascii')
        this.child.stdin.end(text);
        this.child.addListener('exit', (code, signal) => {
            if (code === null || signal !== null) {
              console.log(new Error(`error [code: ${code}] [signal: ${signal}]`))
            }
            this.child = null
        })
    }
}

function talk(line) {
    tts = new TTS("VoiceMeeter Input (VB-Audio VoiceMeeter VAIO)", 0);
    tts.speak(line);
}

module.exports = talk;
