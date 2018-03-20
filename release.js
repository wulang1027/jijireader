// Build and send dist dir to ipfs,log the latest hash

const ipfsAPI = require('ipfs-api')
const path = require('path');
const dir = require('node-dir');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

let files=[]
dir.readFilesStream('./dist', (err, stream, filepath, next) => {
    //console.log(err, stream, filepath);
    files.push({path: filepath, content: stream});
    next();
},
() => {
    ipfs.files.add(files, function (err, files) {
        console.log(`Done!\naccess: https://ipfs.infura.io/ipfs/${files[files.length-1].hash}\n`);
    })
})

