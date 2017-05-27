var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var radius = canvas.height / 2;
ctx.translate(radius, radius);
radius = radius * 0.8;


function drawClock() {
    var seed = Math.floor(Math.random() * 100) + 1 ;
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);
    if (seed == 11) {
        ChangeGifBackground('random');
    } else {
        ChangeGifBackground('none');

    }
    
}




function drawTime(ctx, radius) {
    var now = new Date();
    var hour = now.getHours() - startHour - 4;
    var minute = now.getMinutes() - startminute;
    var second = now.getSeconds() - startsecond;
    //hour
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(ctx, hour, radius * 0.5, 2);
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, 2);
    // second
    second = (second * Math.PI / 30);
    drawHand(ctx, second, radius * 0.9, 2);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.moveTo(0, 0);
    ctx.rotate(-pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(pos);
}

function drawNumbers(ctx, radius) {
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (num = 1; num < 5; num++) {
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.8);
        ctx.rotate(-ang);
       ctx.fillText(num.toString(), 0, 0);
    //    ctx.fillText("A", 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.8);
        ctx.rotate(-ang);
    }
}

function drawFace(ctx, radius) {

  
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
        ctx.lineWidth = 2;
    ctx.stroke();



    ctx.fillStyle = '#000';
 
}

setNow();

  var now = new Date();
    var startHour = now.getHours();
    var startminute = now.getMinutes();
    var startsecond = now.getSeconds();

    
function setNow() {
   now = new Date();
    startHour = now.getHours();
    startminute = now.getMinutes();
    startsecond = now.getSeconds();
    drawClock();
}