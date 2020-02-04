const matrix = require("@matrix-io/matrix-lite");
const swimClient = require('@swim/client');
const nfc = require("@matrix-io/matrix-lite-nfc");
const swim = require("@swim/core");
const swimUi = require("@swim/ui")
const ndef = require('ndef');

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
        this.rainbowStartIndex = 0;
        this.currentLedAnimation = "default";
        this.currRainbowStep = 0;
        this.isConnected = false;

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
        swimClient.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/animation').laneUri('ledAnimation')
            .didSet((value)=> {
                this.currentLedAnimation = value.stringValue("default");
            })
            .didConnect(() => {
                this.isConnected = true;
            })
            .didClose(() => {
                this.isConnected = false;
            })
            .open();        

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
                let records = ndef.decodeMessage(tag.ndef.content);
                tag["ndefRecords"] = records;
                tag["decodedPayload"] = ndef.text.decodePayload(records[0].payload);
            } else {
                console.log(`Nothing Was Scanned: ${code}`);
                tag["ndefRecords"] = null;
                tag["decodedPayload"] = null;
            }

            this.currNfcCode = code;
            tag["code"] = code;

            this.doSwimCommand(this.swimUrl, `/nfc`, 'updateNfcData', JSON.stringify(tag));
        }
    }

    /**
       * Connect to swim downlinkValue to grab the latest color and set the color
       */
    updateColor() {
        if(this.isConnected) {
            swimClient.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/color').laneUri('rgbw')
                .didSet((value)=> {
                    const color = value.toAny();
                    this.setColor(color);
                }).open();
        }
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
        switch(this.currentLedAnimation) {
            case "rainbowFadeIn":
                this.rainbows("in");
                break;
            case "rainbowFadeOut":
                this.rainbows("out");
                break;
            default:
                if(!this.colorChange) {
                    this.lastColor = this.everloop.shift();
                    this.everloop.push(this.lastColor);
                    matrix.led.set(this.everloop);
                }
                break;
    
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
        if(this.isConnected) {
            try {
                swimClient.command(hostUri, nodeUri, laneUri, msg);
            } catch(ex) {
                console.info(`*** doSwimCommand error for ${hostUri}${nodeUri}/${laneUri} ***`);
                console.info(ex);
                console.info(`*** Make sure the Swim server is running  ***\r\n`);
            }        
    
        } else {
            console.info("swim client offline");
        }
    }

    interpolate(startValue, endValue, stepNumber, lastStepNumber) {
        return (endValue - startValue) * stepNumber / lastStepNumber + startValue;
    }    

    rainbows(fadeDirection) {
        const startColor = swimUi.Color.rgb(0, 0, 255, 0.2).hsl();
        const endColor = swimUi.Color.rgb(255, 0, 0, 0.75).hsl();
        
        const maxPixels = matrix.led.length;
        const colorArray = [];


        for(let i=0; i<maxPixels;i++) {
            const newRgb = new swimUi.Color.rgb().hsl();
            newRgb.h = this.interpolate(startColor.h, endColor.h, i, maxPixels);
            newRgb.s = 1;
            newRgb.l = this.currRainbowStep;
            colorArray.push(newRgb.rgb().toString());
        }
        matrix.led.set(colorArray);


        if(fadeDirection === "in") {
            this.currRainbowStep = this.currRainbowStep + 0.1;
        }
        if(fadeDirection === "out") {
            this.currRainbowStep = this.currRainbowStep - 0.15;
        }

        if(this.currRainbowStep > 0.5 && fadeDirection === "in") {
            this.doSwimCommand(this.swimUrl, `/settings/animation`, 'setLedAnimation', "rainbowFadeOut");
        } 
        if(this.currRainbowStep < 0 && fadeDirection === "out") {
            this.doSwimCommand(this.swimUrl, `/settings/animation`, 'setLedAnimation', "default");                
        }
        
        
    }

}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

