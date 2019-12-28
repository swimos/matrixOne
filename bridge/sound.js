const matrix = require("@matrix-io/matrix-lite");
var fs = require('fs');
const swim = require('@swim/client');
const swimUrl = "ws://127.0.0.1:9001";

var micInstance  = matrix.alsa.mic({
    rate: '16000',
    debug: true,
    exitOnSilence: 0,
    channels: '1'
  });


var micInputStream = micInstance.getAudioStream();
 
var outputFileStream = fs.WriteStream('output.wav');
 
micInputStream.pipe(outputFileStream);
 
micInputStream.on('data', function(data) {
    // console.log("Received Input Stream: " + data.length);
    console.info(data.toString("ascii"))
    // swim.command(swimUrl, `/sensor/mic1`, 'addLatest', data.toString());
    const arr = data;
    // console.info(arr.length);
    let strArr = "";
    for(i=0; i<1024; i++) {
        // console.info(i + ":" + arr[i]);
        strArr += arr[i];
        if(i != 1023) {
            strArr += ",";
        }
        // swim.command(swimUrl, `/sensor/mic1`, 'addLatest', arr[i]);
    }
    // swim.command(swimUrl, `/sensor/mic1`, 'pushBuffer', strArr);
    // console.info(strArr);
});
 
// micInputStream.on('error', function(err) {
//     cosole.log("Error in Input Stream: " + err);
// });
 
// micInputStream.on('startComplete', function() {
//     console.log("Got SIGNAL startComplete");
//     setTimeout(function() {
//             micInstance.pause();
//     }, 5000);
// });
    
// micInputStream.on('stopComplete', function() {
//     console.log("Got SIGNAL stopComplete");
// });
    
// micInputStream.on('pauseComplete', function() {
//     console.log("Got SIGNAL pauseComplete");
//     setTimeout(function() {
//         micInstance.resume();
//     }, 5000);
// });
 
// micInputStream.on('resumeComplete', function() {
//     console.log("Got SIGNAL resumeComplete");
//     setTimeout(function() {
//         micInstance.stop();
//     }, 5000);
// });
 
// micInputStream.on('silence', function() {
//     console.log("Got SIGNAL silence");
// });
 
// micInputStream.on('processExitComplete', function() {
//     console.log("Got SIGNAL processExitComplete");
// });
 
micInstance.start();