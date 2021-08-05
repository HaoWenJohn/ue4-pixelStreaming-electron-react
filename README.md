#install
###ue4
1.enable pixel streaming plugins; 

2.play->advanced setting ->playing in standalone game ->additional launch parameters:-PixelStreamingIP=localhost -PixelStreamingPort=8888 
###electron
you should install nodejs 14: 

https://nodejs.org 

and yarn
```bash
node install yarn
```
then install dependencies:
```bash
yarn install 
```
#run
1.start electron:
```bash
yarn start
```
2.start ue in standalone game mode.

#package
1.package electron
```bash
yarn package
```
2.package ue4 project

3.write a .bat file for convenience using like:
```bash
start my-electron-app-name.exe
start my-ue4-project.exe -AudioMixer -PixelStreamingIP=localhost -PixelStreamingPort=8888 -RenderOffScreen
```
