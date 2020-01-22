const matrix = require("@matrix-io/matrix-lite");
const swimClient = require('@swim/client');
const nfc = require("@matrix-io/matrix-lite-nfc");
const swim = require("@swim/core");

class Main {
    constructor() {
        this.swimUrl = "ws://127.0.0.1:9001";
        this.showDebug = true;
        this.everloop = null;
        this.lastColor = null;
        this.mainLoop = null;
        this.mainLoopTimeMS = 50;
        this.animPixelColor = {r:0, g:0, b:0, w:0};
        this.currImuValues = null;
        this.currUV = 0;
        this.humidity = 0;
        this.temperature1 = 0;
        this.temperature2 = 0;
        this.altitude = 0;
        this.pressure = 0;
        this.currNfcCode = 0;

        this.colorChange = false;
        this.nfcOptions = {
            rate: 50,    // Read loop speed (Milliseconds)
            // All these options enabled will slow reading speeds
            info: true,  // Generic information for any NFC tag
            pages: true, // All page data
            page: 0,     // A single page(faster than pages)
            ndef: true   // All NDEF data
        }

        this.initialize();
    }

    initialize() {
        if(this.showDebug) {
            console.info('[Main]: initialize');
        }
        this.everloop = new Array(matrix.led.length).fill({});
        this.everloop[0] = this.animPixelColor;
        this.updateColor(); // Init color change
    }

    start() {
        if(this.showDebug) {
            console.info('[Main]: start');
        }
        try {
            this.mainLoop = setInterval(() => {
                this.startNfcMonitor();
                this.updateLedAnim();
                this.updateImuValues();
                this.updateUV();
                this.updateHumidity();
                this.updatePressure();
            }, this.mainLoopTimeMS);
    
        } catch(ex) {
            console.info("Error in startup", ex);
            setTimeout(this.start.bind(this), 1000);
        }
    }

    stop() {
        if(this.showDebug) {
            console.info('[Main]: stop');
        }
        this.everloop = new Array(matrix.led.length).fill({}); // clear LEDs
        matrix.led.set(this.everloop);
        this.stopNfcMonitor();
        clearTimeout(this.mainLoop);
    }

    startNfcMonitor() {
        nfc.read.start(this.nfcOptions, (code, tag) => {
            this.handleNfcMessage(code, tag);
        });        
    }

    stopNfcMonitor() {
        nfc.read.stop();
    }

    handleNfcMessage(code, tag) {
        if(this.currNfcCode !== code) {
            
            if (code === 256){
                console.log(`Tag Was Scanned: ${code}`);
                console.info(tag.ndef.content);
                console.info(String.fromCharCode.apply(String, tag.ndef.content));
                // console.log(JSON.stringify(tag));
            } else {
                console.log(`Nothing Was Scanned: ${code}`);
                // console.log(tag);
            }

            this.currNfcCode = code;
            tag["code"] = code;
            // const nfcMsg = `{"code": ${code}, "tag", "${JSON.stringify(tag)}"`;

            this.doSwimCommand(this.swimUrl, `/nfc`, 'updateNfcData', JSON.stringify(tag));
        }
    }

    /**
       * Connect to swim downlinkValue to grab the latest color and set the color
       */
    updateColor() {
        swimClient.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/color').laneUri('rgbw')
            .didSet((value)=> {
                const color = value.toAny();
                this.setColor(color);
            }).open();
    }

    /**
       * Set new light color
       */
    setColor(newColor) {
        this.colorChange = true;
        this.everloop.forEach((color, i)=> {
            if(color.r !== null && color.r !== undefined) {
                this.everloop[i] = newColor;
                this.colorChange = false;
            }
        });
    }

    /**
       * Looping light animation
       */
    updateLedAnim() {
        if(!this.colorChange) {
            this.lastColor = this.everloop.shift();
            this.everloop.push(this.lastColor);
            matrix.led.set(this.everloop);
        }
    }

    updateImuValues() {
        this.currImuValues = matrix.imu.read();
        if(this.currImuValues !== null) {
            for(let dataKey in this.currImuValues) {
                // console.info(this.swimUrl, `/sesnor/${dataKey}`, 'addLatest', this.currImuValues[dataKey]);
                this.doSwimCommand(this.swimUrl, `/sensor/${dataKey}`, 'addLatest', this.currImuValues[dataKey]);
            }
        }
    }

    updateUV() {
        const newUV = matrix.uv.read();
        this.currUV = newUV.uv;
        try {
            this.doSwimCommand(this.swimUrl, `/sensor/uv`, 'addLatest', this.currUV);
        } catch(ex) {
            console.info("updateUV", ex);
        }

        
    }

    updateHumidity() {
        const newValues = matrix.humidity.read();
        if(this.humidity != newValues.humidity) {
            this.humidity = newValues.humidity;
            this.doSwimCommand(this.swimUrl, `/sensor/humidity`, 'addLatest', this.humidity);
        }
        if(this.temperature1 != newValues.temperature) {
            this.temperature1 = newValues.temperature;
            this.doSwimCommand(this.swimUrl, `/sensor/temperature1`, 'addLatest', this.temperature1);
        }
    }

    updatePressure() {
        const newValues = matrix.pressure.read();
        if(this.altitude != newValues.altitude) {
            this.altitude = newValues.altitude;
            this.doSwimCommand(this.swimUrl, `/sensor/altitude`, 'addLatest', this.altitude);
        }
        if(this.temperature2 != newValues.temperature) {
            this.temperature2 = newValues.temperature;
            this.doSwimCommand(this.swimUrl, `/sensor/temperature2`, 'addLatest', this.temperature2);
        }
        if(this.pressure != newValues.pressure) {
            this.pressure = newValues.pressure;
            this.doSwimCommand(this.swimUrl, `/sensor/pressure`, 'addLatest', this.pressure);
        }

    }

    doSwimCommand(hostUri, nodeUri, laneUri, msg) {
        try {
            swimClient.command(hostUri, nodeUri, laneUri, msg);
        } catch(ex) {
            console.info(`*** doSwimCommand error for ${hostUri}${nodeUri}/${laneUri} ***`);
            console.info(ex);
            console.info(`*** Make sure the Swim server is running  ***\r\n`);
        }        
    }

}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

