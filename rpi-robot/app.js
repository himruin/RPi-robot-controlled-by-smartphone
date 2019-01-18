//IMPORTANT: Express ver. 4.15.4.(not the latest! one) is a must to assure the program will work, 
//the latest version of express brings changes to implementation methods of socket.io

//
//implementation of connections between express-server-socket.io
//plus implementation of rpio
//

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rpio = require('rpio');

app.use(express.static(path.join(__dirname, '/public')));

//
//declaration of GPIOs for motor 1 and 2
//

const M1_en=12;
const M1_out1=13;
const M1_out2=15;

const M2_en=32;
const M2_out1=24;
const M2_out2=26;

//
//setting of starting voltages on driver GPIOs - OUTPUT means that RPi will be used to set voltage there: HIGH or LOW, instead of receive INPUT ) 
//

rpio.open(M1_en, rpio.OUTPUT, rpio.LOW);
rpio.open(M1_out1, rpio.OUTPUT, rpio.LOW);
rpio.open(M1_out2, rpio.OUTPUT, rpio.LOW);

rpio.open(M2_en, rpio.OUTPUT, rpio.LOW);
rpio.open(M2_out1, rpio.OUTPUT, rpio.LOW);
rpio.open(M2_out2, rpio.OUTPUT, rpio.LOW);


//
// declaration of moving functions
//

function LEFT() {
 rpio.write(M1_out1, rpio.HIGH);
 rpio.write(M1_out2, rpio.LOW);
 rpio.write(M2_out1, rpio.LOW);
 rpio.write(M2_out2, rpio.HIGH);
}

function RIGHT() {
 rpio.write(M1_out1, rpio.LOW);
 rpio.write(M1_out2, rpio.HIGH);
 rpio.write(M2_out1, rpio.HIGH);
 rpio.write(M2_out2, rpio.LOW);
}

function FORWARD() {
 rpio.write(M1_out1, rpio.LOW);
 rpio.write(M1_out2, rpio.HIGH);
 rpio.write(M2_out1, rpio.LOW);
 rpio.write(M2_out2, rpio.HIGH);
}

function BACKWARD() {
 rpio.write(M1_out1, rpio.HIGH);
 rpio.write(M1_out2, rpio.LOW);
 rpio.write(M2_out1, rpio.HIGH);
 rpio.write(M2_out2, rpio.LOW);  
}

function mENABLE() {
 rpio.write(M1_en, rpio.HIGH);
 rpio.write(M2_en, rpio.PWM);
}

function mDISABLE() {
 rpio.write(M1_en, rpio.LOW);
 rpio.write(M2_en, rpio.LOW);
}

//
//if socket.io is implemented properly: information when someone enters/leaves the application is sent
//

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  console.log('user disconnected');
  mDISABLE();
 });

//
//joystick-motors connection
//

 socket.on('joystickData', function(joystickData){
   console.log(joystickData);
   mENABLE();
   if(joystickData == 'left') LEFT();
   if(joystickData == 'right') RIGHT();
   if(joystickData == 'up') FORWARD();
   if(joystickData == 'down') BACKWARD();
 });
 socket.on('joystickReleased', function(){
   console.log('Stop');
   mDISABLE();
 });
});

server.listen(3000, '192.168.43.219', function () {
 var port = server.address().port
 console.log('Server listening:%s...', port);
});

