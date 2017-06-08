var App = angular.module('clock', ['ngAnimate']);
var currTimeForColorChange = 0;
var minutesToCrazyMode = 5;

var compositionQuestions = {};
var abQuestions = {};

function getQuestionsFromCSV() {
  $.ajax({
    type: "GET",
    url: "js/data/ab.csv",
    dataType: "text",
    success: function (data) {
      abQuestions = csvJSON(data);
      // console.log(abQuestions[1]);
    }
  });

  $.ajax({
    type: "GET",
    url: "js/data/comp.csv",
    dataType: "text",
    success: function (data) {
      compositionQuestions = csvJSON(data);
      // console.log(compositionQuestions[1].question);
    }
  });

}

function csvJSON(csv) {
  var lines = csv.split("\n");
  var result = [];
  var headers = lines[0].split(",");
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      // console.log(headers[j]);
      if (currentline[j])
      {
      obj[headers[j]] = currentline[j];

      }
else {
      obj[headers[j]] = currentline[0].split(' או ')[0];
  
}
    }
    result.push(obj);
  }
  return result;
}


App.controller('index', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

  getQuestionsFromCSV();

  // console.log(compositionQuestions);
  $scope.currtopic = 'ba';
  var maincolorStart = '#F8E848';

  $scope.maincolor = maincolorStart;

  $scope.metadata = {};
  $scope.questionPlaceholder = "questions";
  var maxImagesinArr = 5;
  var chanseForImageCreation = 20; // start from 1:20
  $scope.posterImages = [];



  var totalSecondsCountdown = 0;
  var tickCounter = 0;
  var tickRandomSeed = 0;
  var secondsCountdown = 0;


  // Changes the question in the page
  let questionsHasQuestionBeenAnswered = 0;
  let questionsPrevQuestion = 0;
  let questionsTimePerQuestion = 30;
  let questionsTypeSpeedPerQuestion = 30;
  let questionsTimePast = 0;
  var isCrazy = false;
  var questionsArr = questionsArr1;
  var questionsAnswersArr = questionsAnswersArr1;
  var questionsCurrQuestion = 1;
  $scope.isAnswerVisible = true







  var config = {
    apiKey: "AIzaSyCc04tscd1bx3BQR21UnCtBJA6RlTHzYiY",
    authDomain: "clock-2517a.firebaseapp.com",
    databaseURL: "https://clock-2517a.firebaseio.com",
    projectId: "clock-2517a",
    storageBucket: "clock-2517a.appspot.com",
    messagingSenderId: "562231687355"
  };
  firebase.initializeApp(config);


  //get designer list from DB
  var dbObjMetaRef = firebase.database().ref('metadata');
  dbObjMetaRef.on('value', function (snapshot) {
    $scope.metadata.designersnames = snapshot.val().designernames;
    $scope.metadata.dailytpoic = snapshot.val().dailytpoic;
    $scope.$apply();
  });



  // Gif backgrounds - pull all topics from DB
  var dbObjTopicsRef = firebase.database().ref('color');
  dbObjTopicsRef.on('value', function (snapshot) {
    if (snapshot.val()) {
      $scope.colors = snapshot.val();
      maincolorStart = $scope.colors.prime;
      $scope.maincolor = chroma.mix(maincolorStart, 'red', (totalSecondsCountdown / 10800)).hex();
      setNow();


      // $scope.posterStyleHighlight = {'background': +' !important','color': $scope.colors.secondary,'border': 'solid 2px '+$scope.colors.secondary};
      // $scope.imageStyleHighlight = {'background': $scope.colors.prime};
    }
  });


  $scope.pushTopic = function (topicURL, topicTitle, topicTime) {
    // Updates object to contain all new images
    var updates = {};
    // Add maximum of 10 new imagess
    var objkey = firebase.database().ref().child('topisobj').push().key; // New key for object
    // Creating the data OBJ
    var topicData = {
      title: topicTitle,
      imgAddr: topicURL,
      date: topicTime,
      key: objkey
    };
    updates['/topisobj/' + objkey] = topicData;
     firebase.database().ref().update(updates);
  }

  var deadline = new Date();
  deadline.setHours(24, 18, 0, 0);

  $scope.inputKeyPress = function (keyEvent) {
    if (keyEvent.which === 13 && $scope.addedValue != '') {
      if ($scope.addedValue == 'clockstart') {
        firebase.database().ref('clockstart/start').set(1);
      } else if ($scope.addedValue == 'clockcrazy') {
        $scope.goCrazy();
      } else {
        $scope.isAnswerVisible = false;

        $scope.ChangeTopic();
        questionsHasQuestionBeenAnswered = 1;
        questionsTimePast = 0;
      }
    }
  }

  var tick = $interval(function () {
    tickCounter++;
    questionsTimePast++;

    let currTimeProg = totalSecondsCountdown/14400;
    // console.log(currTimeProg*100)
    if ((currTimeProg*100)%1 == 0) {
   changeCircularProgress(Math.floor(currTimeProg*100));    
    } 


    $scope.remTimeCountdown = getTimeRemaining(deadline);
    $scope.timepass = (questionsTimePast / questionsTimePerQuestion) * 100;
    // $scope.currquestion.timepass = '10'
    // console.log(questionsTimePast/questionsTimePerQuestion);
    if (questionsTimePast > questionsTimePerQuestion) {
      $scope.changeQuestion();
    }


    // when the clock is working - change the color to red during 3 hours
    if (totalSecondsCountdown > (60*minutesToCrazyMode)) {
      // $scope.maincolor = chroma.mix(maincolorStart, 'red', (totalSecondsCountdown / 10800)).hex();
      if (!$scope.isCrazy) {   // Go crazy on 3rd hour
        $scope.goCrazy();
    }
    }

    // change question pool on every other hour
    let now = new Date();
    let currhour = now.getHours();
    if (currhour % 2) {
      currentQuestionsPool = 1;
    } else {
      currentQuestionsPool = 2;
    }
  }, 1000);


  $scope.goCrazy = function () { // Change on last 30 mins
    $scope.isCrazy = true;
    isCrazy = true;
    questionsTimePerQuestion = 3;
    questionsTypeSpeedPerQuestion = 0;
    $scope.maincolor = '#FF0000';
    maincolorStart = '#ff0000';
  }



  // var currentQuestionsPool = 2;
var TmpStrAnswer;

  $scope.changeQuestion = function (dontWriteAnswer) {
   
   // TODO: select from 2 questions structures
    currQuestionsOBJ = abQuestions;

    questionsTimePast = 0;
   
   
    // Select random different quesion
    questionsCurrQuestion = Math.floor((Math.random() * currQuestionsOBJ.length));
    while (questionsCurrQuestion == questionsPrevQuestion) {
      questionsCurrQuestion = Math.floor((Math.random() * currQuestionsOBJ.length));
    }

    if (dontWriteAnswer) { // if user answered the prev question
      $(".inputcontainer__question").typed({
        strings: [currQuestionsOBJ[questionsCurrQuestion].question + "?"],
        typeSpeed: questionsTypeSpeedPerQuestion,
        showCursor: false,
        callback: function () {
          questionsTimePast = 0; // zero out timer
          questionsHasQuestionBeenAnswered = 0; // zero out questions\Has Question Been Answered
          $scope.isAnswerVisible = true
        }
      });
    } else { // if user hasnt typed anything
      TmpStrAnswer = currQuestionsOBJ[questionsPrevQuestion];

      // clockSpeak(TmpStrAnswer);

      $(".inputcontainer__answer").typed({
        strings: [TmpStrAnswer.option_a, ''],
        typeSpeed: questionsTypeSpeedPerQuestion,
        showCursor: false,
        callback: function () {
          $scope.isAnswerVisible = false;
          //TODO: change to eng
          $scope.ChangeTopic(TmpStrAnswer.option_a);
          // clockSpeak();
          $(".inputcontainer__question").typed({
            strings: [currQuestionsOBJ[questionsCurrQuestion].question + "?"],
            typeSpeed: questionsTypeSpeedPerQuestion,
            showCursor: false,
            callback: function () {
              questionsHasQuestionBeenAnswered = 0;
              $scope.isAnswerVisible = true

            }
          });
        }
      });
    }
    questionsPrevQuestion = questionsCurrQuestion;
  }

  var translatedValue = '';

  function addImage(currentstring,originalString,toPush) {
    $.ajax({
      url: "https://api.giphy.com/v1/gifs/search?q=" + currentstring.replace(/%20/g, '+') + "&api_key=dc6zaTOxFJmzC",
      type: "GET",
      success: function (response) {

        let numOfImagesToAdd = response.data.length;

        if (numOfImagesToAdd > 0) {
          let randomURL = response.data[Math.floor((Math.random() * response.data.length))].images.fixed_width.url;
          
          if (originalString)
          {
            currentstring = originalString;
          }
          
          $scope.currtopic = {
            title: currentstring,
            imgAddr: randomURL
          };

          $scope.posterImages.push({
            title: currentstring,
            src: randomURL,
            topSpace: Math.floor((Math.random() * 150)),
            posterWidth: Math.floor((Math.random() * 220) + 100),
            date: getCurrTime(),
            hour: $scope.metadata.dailytpoic
          });
          if (toPush)
          {
            $scope.pushTopic(randomURL, $scope.addedValue, '1');

          }
          $scope.addedValue = '';


          if (questionsHasQuestionBeenAnswered) {
            $scope.changeQuestion(1);
            questionsHasQuestionBeenAnswered = 0;
            questionsTimePast = 0;

          }
        } else {
          //no images found, enter some random value
         // $scope.ChangeTopic('robot');
         addImage('robot',originalString,toPush);
        }
      }
    });
  }
  var IsQueryEnteredByUser = 0;

  $scope.ChangeTopic = function (gifquery) {
    let result;
    let count = 0;
    IsQueryEnteredByUser = 0;
    if ($scope.posterImages.length > maxImagesinArr) { // Max 10 images array shift
      $scope.posterImages.shift();
    }
    // if (!gifquery) { // if this is a user-entered value
      // console.log(gifquery);      
      // Add the user entered query as is to the DB
      addQueryToDataBase($scope.addedValue);
      // Change the value to the translation if matches
        // trying to get the topic from translate
        // translatedValue = 'robot';
        translatedValue = $scope.addedValue;
        let toPush = true;
        if (gifquery) {
          translatedValue = gifquery;
         toPush = false;
        }
        if (gifquery=='robot') {
           translatedValue = $scope.addedValue;
         toPush = true;
        }
        $.get('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20170531T074712Z.5121b5af8a368ef5.6b4f300f5fdb567888847853065aed1c2daf5453&text=' + translatedValue + '&lang=en', function (data) {
          // When translation is available (200), enter the text to the addImage function
          // translatedValue =
          let newValue =  data.text[0];
          addImage(newValue,translatedValue,toPush);
        })
        .fail(function() {
          console.log('no translation!');
       addImage('robot',translatedValue,toPush);
  });
      
    // } else {
      // If the user didnt enter a value just add the TmpStrAnswer 1st optiion
      // addImage(gifquery,TmpStrAnswer.option_a);
    // }
  }


  function getTimeRemaining(endtime) {
    let t = Date.parse(endtime) - Date.parse(new Date());
    let seconds = Math.floor((t / 1000) % 60);
    let minutes = Math.floor((t / 1000 / 60) % 60);
    let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return {
      'total': t,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }


  function getCurrTime() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;

  }

  // Starting the clock on remote trigger
  var dbObjClockeRef = firebase.database().ref('clockstart');
  dbObjClockeRef.on('value', function (snapshot) {
    if (snapshot.val().start) {
      setNow();
      setInterval(function () {
        $scope.drawClock();
      }, 1000);
      $scope.isClockOn = true;
      $scope.$apply();
      // Reset the trigger
      firebase.database().ref('clockstart').set({
        start: false
      });
    }
  });




  function addQueryToDataBase(query) {

    //TODO: add topic to DB
    // console.log('user enter!');
  }


  function clockSpeak(val) {
    //todo: speak
    let TTSmsg = new SpeechSynthesisUtterance(val);
    window.speechSynthesis.speak(TTSmsg);
  }




  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var radius = 344 ;
  ctx.translate(radius, radius);
   radius = radius * 0.96;


  $scope.drawClock = function () {
    // console.log('in DrawClock');
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);

    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);
  }


function changeCircularProgress(value) {
    	$('.radial-progress').attr('data-progress', Math.floor(value)); 
}


  function drawTime(ctx, radius) {
    let now = new Date();
    let hour = now.getHours() - startHour;
    let minute = now.getMinutes() - startminute;
    let second = now.getSeconds() - startsecond;




    // total seconds since start of countdoen

    totalSecondsCountdown = Math.floor(Math.abs(now.getTime() - startDate.getTime()) / 1000);


    //hour
    hour = hour % 12;
    let newHour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(ctx, newHour*3, radius * 0.5, 20); // TIMES 3 because 4 hours total
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    // minute = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    
    drawHand(ctx, minute, radius * 0.8, 6);
   
    // second
    second = (second * Math.PI / 30);
    // drawHand(ctx, second, radius * 0.9, 4);

    // console.log(((second * -1 )/6));
    // $scope.maincolor = 'fff';


  }

  function drawHand(ctx, pos, length, width) {
    // if (isCrazy == true) {
    //   ctx.strokeStyle = "#ffffff";
    // }

      if (width == 6) {
      ctx.strokeStyle = "#ffffff";
    }
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
    let ang;
    let num;
    ctx.font = "112px simpler";
    ctx.textBaseline = "middle";
          ctx.fillStyle = 'blue';
    ctx.textAlign = "center";
    for (num = 1; num < 5; num++) {
      ang = (num ) * Math.PI / 2;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.8);
      ctx.rotate(-ang);
      // if (isCrazy == true) {
      //   ctx.fillStyle = '#ffffff';
      // }
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
    ctx.fillStyle = $scope.maincolor;
    // ctx.fill();
    ctx.lineWidth = 20;
     ctx.strokeStyle = "#0000ff";
    // if (isCrazy == true) {
    //   ctx.strokeStyle = "#ffffff";
    // }
    ctx.stroke();



    ctx.fillStyle = '#000';

  }

  setNow();

  var now = new Date();
  var startHour = now.getHours();
  var startminute = now.getMinutes();
  var startsecond = now.getSeconds();

  var startDate = new Date();

  function setNow() {
    startDate = new Date();
    startHour = startDate.getHours();
    startminute = startDate.getMinutes();
    startsecond = startDate.getSeconds();
    $scope.drawClock();
  }

}]);