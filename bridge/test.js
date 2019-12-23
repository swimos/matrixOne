// Set Initial Variables \\
var zmq = require('zeromq');// Asynchronous Messaging Framework
var matrix_io = require('matrix-protos').matrix_io;// Protocol Buffers for MATRIX function
var matrix_ip = '127.0.0.1';// Local IP
var matrix_everloop_base_port = 20021// Port for Everloop driver
var matrix_device_leds = 0;// Holds amount of LEDs on MATRIX device

// ERROR PORT \\
var errorSocket = zmq.socket('sub');// Create a Subscriber socket
errorSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 2));// Connect Subscriber to Error port
errorSocket.subscribe('');// Subscribe to messages
// On Message
errorSocket.on('message', (error_message) => {
    console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

// DATA UPDATE PORT \\
var updateSocket = zmq.socket('sub');// Create a Subscriber socket
updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 3));// Connect Subscriber to Data Update port
updateSocket.subscribe('');// Subscribe to messages
// On Message
updateSocket.on('message', (buffer) => {
    var data = matrix_io.malos.v1.io.EverloopImage.decode(buffer);// Extract message
    matrix_device_leds = data.everloopLength;// Save MATRIX device LED count
});

// KEEP-ALIVE PORT \\
var pingSocket = zmq.socket('push');// Create a Pusher socket
pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 1));// Connect Pusher to Keep-alive port
pingSocket.send('');// Send a single ping

// BASE PORT \\
var configSocket = zmq.socket('push');// Create a Pusher socket
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_everloop_base_port);// Connect Pusher to Base port

// Create an empty Everloop image
var image = matrix_io.malos.v1.io.EverloopImage.create();

// Loop every 50 milliseconds
setInterval(function(){
    // For each device LED
    for (var i = 0; i < matrix_device_leds; ++i) {
        // Set individual LED value
        image.led[i] = {
            red: Math.floor(Math.random() * 200)+1,
            green: Math.floor(Math.random() * 255)+1,
            blue: Math.floor(Math.random() * 50)+1,
            white: 0
        };
    }

    // Store the Everloop image in MATRIX configuration
    var config = matrix_io.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send MATRIX configuration to MATRIX device
    if(matrix_device_leds > 0)
        configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
},50);