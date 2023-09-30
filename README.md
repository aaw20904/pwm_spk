# principle
The program reads raw blocks from a SD card using the SDIO interface.Audio data represented as mono 8-bit 32kHz data.THe timer works in PWM mode and generate 8-bit PWM signal.
# pwm_spk
This project contains two parts: a NodeJS soft - this program read audio data from the WAV file 8-bit mono 32kHz  with name "1.wav" (the file can be without any additional media information - only standard header) and write it info sectors of SD card represented in system as disk "E". The card contains only raw data - it isn`t formatted! You can use any other soft to write data into SD card. Second part of software - it is a STM32F411 CubeMX project for the IAR compiler.I used HAL library to write this code.  
# write_soft
Contains NodeJS software for write operation data into a SD card.  
