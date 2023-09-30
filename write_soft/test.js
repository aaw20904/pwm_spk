const fs = require('fs');
const wav = require('wav');

// Function to encode 8-bit PCM data to ADPCM
function adpcmEncode(input) {
    // ... (your adpcmEncode function)
    const step_table = [16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66];
    let step_index = 2;
    let prev_sample = input[0];
    let output = Buffer.alloc(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
        let diff = input[i] - prev_sample;
        let quantized_diff = 0;
        let delta = step_table[step_index] >> 3;

        for (let j = 0; j < 16; j++) {
            if (diff >= delta) {
                quantized_diff |= (1 << (15 - j));
                diff -= delta;
            }
            delta >>= 1;
        }

        let adpcm_sample = (quantized_diff & 0x7F) | (step_index << 7);
        output[i / 2] = adpcm_sample;
        prev_sample += step_table[step_index] * (quantized_diff & 0x7F) - 1;

        if (prev_sample > 127) prev_sample = 127;
        if (prev_sample < -128) prev_sample = -128;

        step_index += adpcm_sample & 0x7F;
        if (step_index < 0) step_index = 0;
        if (step_index > 15) step_index = 15;
    }

    return output;
}

// Function to decode ADPCM data to 8-bit PCM
function adpcmDecode(input) {
    // ... (your adpcmDecode function)
    const step_table = [16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66];
    let step_index = 2;
    let prev_sample = input[0] & 0x7F;
    let output = Buffer.alloc(input.length * 2);

    for (let i = 0; i < input.length; i++) {
        let adpcm_sample = input[i];
        let quantized_diff = adpcm_sample & 0x7F;
        let delta = step_table[step_index] >> 3;
        let diff = 0;

        for (let j = 0; j < 8; j++) {
            if (quantized_diff & (1 << (7 - j))) {
                diff += delta;
            }
            delta >>= 1;
        }

        if (adpcm_sample & 0x80) {
            diff = -diff;
        }

        prev_sample += diff;
        if (prev_sample > 127) prev_sample = 127;
        if (prev_sample < -128) prev_sample = -128;

        step_index += adpcm_sample & 0x7F;
        if (step_index < 0) step_index = 0;
        if (step_index > 15) step_index = 15;

        output[i * 2] = prev_sample;
        output[i * 2 + 1] = prev_sample;
    }

    return output;
}
console.log('Starting...');
// Read input WAV file
const inputBuffer = fs.readFileSync('1.wav');

// Assuming 8-bit PCM audio, 32,000 samples per second
const sampleRate = 32000;
const bitDepth = 8;
const bytesPerSample = bitDepth / 8;
const samplesPerSecond = sampleRate;
const channels = 1; // Mono

// Calculate total samples
const totalSamples = inputBuffer.length / bytesPerSample;

// Assuming 512 byte blocks
const blockSize = 512;

// Encode and decode in blocks
let adpcmData = Buffer.alloc(0);

for (let i = 0; i < totalSamples; i += blockSize) {
    const blockStart = i * bytesPerSample;
    const blockEnd = Math.min((i + blockSize) * bytesPerSample, inputBuffer.length);

    const block = inputBuffer.subarray(blockStart, blockEnd);

    // Encode to ADPCM
    const adpcmBlock = adpcmEncode(block);
    adpcmData = Buffer.concat([adpcmData, adpcmBlock]);

    // Decode back to PCM
    const pcmBlock = adpcmDecode(adpcmBlock);
}

// Write ADPCM data to file
fs.writeFileSync('adpcm_data.adp', adpcmData);

// Decode ADPCM to PCM for output WAV file
const decodedData = adpcmDecode(adpcmData);

// Create a header for the output WAV file
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + decodedData.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM format
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
header.writeUInt16LE(channels * bytesPerSample, 32);
header.writeUInt16LE(bitDepth, 34);
header.write('data', 36);
header.writeUInt32LE(decodedData.length, 40);

// Combine header and data
const outputBuffer = Buffer.concat([header, decodedData]);

// Write output WAV file
fs.writeFileSync('output.wav', outputBuffer);

console.log('Processing complete!');