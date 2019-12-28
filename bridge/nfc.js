
const nfc = require("@matrix-io/matrix-lite-nfc");

let options = {
    rate: 50,    // Read loop speed (Milliseconds)
    // All these options enabled will slow reading speeds
    info: true,  // Generic information for any NFC tag
    pages: true, // All page data
    page: 0,     // A single page(faster than pages)
    ndef: true   // All NDEF data
}
let currCode = 0;
nfc.read.start(options, (code, tag) => {
    if(currCode !== code) {
        if (code === 256){
            console.log("Tag Was Scanned");
            console.log(tag);
        } else {
            console.log(`Nothing Was Scanned: ${code}`);
        }
        currCode = code;
    }
});

// // Create an NDEF message with a link
// var msg = new nfc.message();
// msg.addUriRecord("https://community.matrix.one");

// nfc.read.start({rate: 100, info:true}, (code, tag)=>{
//         if (code === 256){
//             nfc.write.message(msg).then((code)=>{
//                 console.log("Activation Status:" + code.activation + " == " + nfc.status(code.activation));
//                 console.log("Write Status:" + code.write + " == " + nfc.status(code.write));

//                 // Exit after successful writing
//                 if(code.write === 0)
//                     nfc.read.stop();
//             });
//         }

//         else if (code === 1024)
//             console.log("Nothing Was Scanned");
// });