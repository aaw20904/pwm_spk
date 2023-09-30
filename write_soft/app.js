const diskinfo = require('node-disk-info');
const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.read);
const writeFileAsync = promisify(fs.write);

// Replace 'PhysicalDrive1' with the correct disk identifier for your micro SD card.
const diskName = '\\\\.\\E:';

// Specify the sector size (512 bytes).
const sectorSize = 512;

async function readSector(sectorNumber) {
  const fd = fs.openSync(diskName, 'r');
  const buffer = Buffer.alloc(sectorSize);
  const bytesRead = await readFileAsync(fd, buffer, 0, sectorSize, sectorNumber * sectorSize);
  fs.closeSync(fd);
  return buffer.subarray(0, bytesRead);
}

async function writeSector(sectorNumber, data) {
  const fd = fs.openSync(diskName, 'r+');
  const bytesWritten = await writeFileAsync(fd, data, 0, data.length, sectorNumber * sectorSize);
  fs.closeSync(fd);
  return bytesWritten;
}

// Example usage:

async function main(){
  await writeWaveIntoSD();

            /*    try{
                const sectorNumber = 0;
                let dataBuffer= Buffer.allocUnsafe(512);
                dataBuffer.write(" Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped  !EOF");
                console.log(await writeSector(sectorNumber,dataBuffer));
            }catch(e){
                console.log("ERROR"+e);
            }*/
            
}

async function writeWaveIntoSD(fname="1.wav"){
  let flashDescriptor =  fs.openSync("\\\\.\\E:","r+");
  let fileBuffer  = await  fs.promises.readFile(fname);
  let audioData = fileBuffer.subarray(44);
  let numOfCunks = (audioData.length/512)|0;
  const testBuff = Buffer.alloc(512,32);
  
    for ( let sectorNum=0; sectorNum < numOfCunks; sectorNum++) {
      let sectorData = audioData.subarray((sectorNum * 512), ((sectorNum + 1) * 512)  );
       let result = await  writeFileAsync(flashDescriptor, sectorData, 0, sectorData.length, sectorNum * 512);
     
      console.log(sectorNum, result.bytesWritten);
    }
}

main();
