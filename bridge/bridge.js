const matrix = require("@matrix-io/matrix-lite");
const swim = require('@swim/client');

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

        this.colorChange = false;

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
        this.mainLoop = setInterval(() => {
            this.updateLedAnim();
            this.updateImuValues();
            this.updateUV();
            this.updateHumidity();
            this.updatePressure();
        }, this.mainLoopTimeMS);
    }

    stop() {
        if(this.showDebug) {
            console.info('[Main]: stop');
        }
        this.everloop = new Array(matrix.led.length).fill({}); // clear LEDs
        matrix.led.set(this.everloop)
        clearTimeout(this.mainLoop);
    }

    /**
       * Connect to swim downlinkValue to grab the latest color and set the color
       */
    updateColor() {
        swim.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/color').laneUri('rgbw')
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
                swim.command(this.swimUrl, `/sensor/${dataKey}`, 'addLatest', this.currImuValues[dataKey]);
            }
        }
    }

    updateUV() {
        const newUV = matrix.uv.read();
        if(this.currUV != newUV) {
            this.currUV = newUV;
            swim.command(this.swimUrl, `/sensor/uv`, 'addLatest', this.currUV);
        }
    }

    updateHumidity() {
        const newValues = matrix.humidity.read();
        if(this.humidity != newValues.humidity) {
            this.humidity = newValues.humidity;
            swim.command(this.swimUrl, `/sensor/humidity`, 'addLatest', this.humidity);
        }
        if(this.temperature1 != newValues.temperature) {
            this.temperature1 = newValues.temperature;
            swim.command(this.swimUrl, `/sensor/temperature1`, 'addLatest', this.temperature1);
        }
    }

    updatePressure() {
        const newValues = matrix.pressure.read();
        if(this.altitude != newValues.altitude) {
            this.altitude = newValues.altitude;
            swim.command(this.swimUrl, `/sensor/altitude`, 'addLatest', this.altitude);
        }
        if(this.temperature2 != newValues.temperature) {
            this.temperature2 = newValues.temperature;
            swim.command(this.swimUrl, `/sensor/temperature2`, 'addLatest', this.temperature2);
        }
        if(this.pressure != newValues.pressure) {
            this.pressure = newValues.pressure;
            swim.command(this.swimUrl, `/sensor/pressure`, 'addLatest', this.pressure);
        }

    }

}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

