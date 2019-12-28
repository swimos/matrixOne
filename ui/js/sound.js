class SoundDemoScreen {
    
    constructor(parentApp, swimUrl) {
        this.parentDiv = parentApp;
        this.swimUrl = swimUrl;
        // this.links = [];
        this.eqMeters = [];
    }

    start(deviceId) {
        this.deviceId = deviceId;
        this.buildScreen();
        for(let i=0; i<this.eqMeters.length; i++) {
            this.eqMeters[i].start();
        }

    }

    stop() {
        for(let key in this.links) {
            this.links[key].close();
        }
        this.destroyScreen();
    }

    buildScreen() {
        this.eqMeters[0] = new EqMeter(this.parentDiv, 1, this.swimUrl);
    }

    destroyScreen() {
        for(let i=0; i<this.eqMeters.length; i++) {
            this.eqMeters[i].remove();
        }
    }    
}

class EqMeter {

    constructor(targetDiv, channel, swimUrl) {
        this.parentDiv = targetDiv;
        this.micChannel = channel;
        this.swimUrl = swimUrl;
        this.container = null;
        this.header = null;
        this.eqBars = [];
        this.totalBars = 1024;
        this.dataLink = null;
        this.dataBuffer = [];
        this.audioContext = new AudioContext();
    }

    drawLayout() {
        this.container = this.parentDiv.append("div").className("eqBox");
        this.header = this.container.append("h3");
        this.header.text(`Mic ${this.micChannel}`);

        this.eqBarContainer = this.container.append("div").className("eqBarsRow");

        for(let i=0; i<=this.totalBars; i++) {
            this.eqBars[i] = this.eqBarContainer.append("div").className("eqBar");
            this.eqBars[i].left(i);
        }
    }

    openLink() {
        swim.downlinkValue().hostUri(this.swimUrl).nodeUri(`/sensor/mic${this.micChannel}`).laneUri('buffer')
        .didSet((value)=> {
            if(value && value.value) {
                // console.info(value.value);
                const bufferArr = value.value.split(",");
                this.dataBuffer.push(bufferArr);
                window.cancelAnimationFrame(1);
                window.requestAnimationFrame(this.handleBuffer.bind(this));
    
            }
        }).open();   
    }

    start() {
        this.drawLayout();
        this.openLink();
    }

    handleBuffer() {
        const bufferFrame = this.dataBuffer.pop();
        this.playByteArray(bufferFrame);
        for(let i=0; i<bufferFrame.length; i++) {
            let newHeight = (bufferFrame[i]/255) * 100;
            this.eqBars[i].node.style.height =`${newHeight}%`;
        }
    }

    playByteArray(byteArray) {

        var arrayBuffer = new ArrayBuffer(byteArray.length);
        var bufferView = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteArray.length; i++) {
          bufferView[i] = byteArray[i];
        }
    
        this.audioContext.decodeAudioData(arrayBuffer, function(buffer) {
            play(buffer);
        });
    }
    
    // Play the loaded file
    play(buf) {
        // Create a source node from the buffer
        var source = this.audioContext.createBufferSource();
        source.buffer = buf;
        // Connect to the final output node (the speakers)
        source.connect(this.audioContext.destination);
        // Play immediately
        source.start(0);
    }       
}