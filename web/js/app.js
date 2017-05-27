var App = angular.module('clock', ['ngAnimate']);
var currTimeForColorChange = 0;
App.controller('index', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

  $scope.currtopic = 'ba';
  var maincolorStart = '#F8E848';

  $scope.maincolor = maincolorStart;
  $scope.metadata = {};
  $scope.questionPlaceholder = "questions";
  var maxImagesinArr = 9;
  var chanseForImageCreation = 20; // start from 1:20
  $scope.posterImages = [];


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
  var dbObjTopicsRef = firebase.database().ref('topisobj');
  dbObjTopicsRef.on('value', function (snapshot) {
    if (snapshot.val()) {
      $scope.topics = snapshot.val();
      console.log('Topics updated!');
      // $scope.ChangeTopic();

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
    if (keyEvent.which === 13) {
      if ($scope.addedValue == 'clockstart') {
        firebase.database().ref('clockstart/start').set(1);
      } else if ($scope.addedValue == 'clockcrazy') {
        $scope.goCrazy();
      } else {
        $scope.ChangeTopic();
        questionsHasQuestionBeenAnswered = 1;
        questionsTimePast = 0;
      }
    }
  }


  var totalSecondsCountdown = 0;
  var tickCounter = 0;
  var tickRandomSeed = 0;
  var secondsCountdown = 0;
  var tick = $interval(function () {
    tickCounter++;
    questionsTimePast++;
    $scope.remTimeCountdown = getTimeRemaining(deadline);
    $scope.timepass = (questionsTimePast / questionsTimePerQuestion) * 100;
    // $scope.currquestion.timepass = '10'
    // console.log(questionsTimePast/questionsTimePerQuestion);
    if (questionsTimePast > questionsTimePerQuestion) {
      $scope.changeQuestion();
    }


    // when the clock is working - change the color to red during 3 hours
    if (totalSecondsCountdown<10800)
    {
    $scope.maincolor = chroma.mix(maincolorStart, 'red', (totalSecondsCountdown / 10800)).hex();
    } else {
      if (!$scope.isCrazy) 
      {   // Go crazy on 3rd hour
        $scope.isCrazy = true;
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


  // Changes the question in the page
  let questionsHasQuestionBeenAnswered = 0;
  let questionsPrevQuestion = 0;
  let questionsTimePerQuestion = 30;
  let questionsTypeSpeedPerQuestion = 30;
  let questionsTimePast = 0;
  var isCrazy = false;

  $scope.goCrazy = function () { // Change on last 30 mins
    $scope.isCrazy = true;
    isCrazy = true;
    questionsTimePerQuestion = 2;
    questionsTypeSpeedPerQuestion = 0;
    $scope.maincolor = '#FF0000';
    maincolorStart = '#ff0000';
  }



  // var currentQuestionsPool = 2;
  var questionsArr = questionsArr1;
  var questionsAnswersArr = questionsAnswersArr1;


  $scope.changeQuestion = function (dontWriteAnswer) {

    if (currentQuestionsPool == 1) {
      questionsArr = questionsArr1;
      questionsAnswersArr = questionsAnswersArr1;

    } else {
      questionsArr = questionsArr2;
      questionsAnswersArr = questionsAnswersArr2;

    }
    // console.log('in qchange!');

    questionsTimePast = 0;
    // Select random different quesion
    let questionsCurrQuestion = Math.floor((Math.random() * questionsArr.length));
    while (questionsCurrQuestion == questionsPrevQuestion) {
      questionsCurrQuestion = Math.floor((Math.random() * questionsArr.length));
    }


    if (dontWriteAnswer) { // if user answered the prev question
      clockSpeak(questionsArr[questionsCurrQuestion]);

      $(".inputcontainer__question").typed({
        strings: [questionsArr[questionsCurrQuestion] + "?"],
        typeSpeed: questionsTypeSpeedPerQuestion,
        showCursor: false,
        callback: function () {
          questionsTimePast = 0; // zero out timer
          questionsHasQuestionBeenAnswered = 0; // zero out questions\Has Question Been Answered
        }
      });
    } else { // if user hasnt typed anything
      let TmpStrAnswer = questionsAnswersArr[questionsPrevQuestion];

      clockSpeak(TmpStrAnswer);

      $(".inputcontainer__answer").typed({
        strings: [TmpStrAnswer, ''],
        typeSpeed: questionsTypeSpeedPerQuestion,
        showCursor: false,
        callback: function () {
          $scope.ChangeTopic(TmpStrAnswer);
          clockSpeak(questionsArr[questionsCurrQuestion]);

          $(".inputcontainer__question").typed({
            strings: [questionsArr[questionsCurrQuestion] + "?"],
            typeSpeed: questionsTypeSpeedPerQuestion,
            showCursor: false,
            callback: function () {
              questionsHasQuestionBeenAnswered = 0;
            }
          });
        }
      });
    }
    questionsPrevQuestion = questionsCurrQuestion;
  }

  // $scope.ChangeText = function () {
  //   $scope.itterations = 0;
  // }


  $scope.ChangeTopic = function (gifquery) {
    let IsQueryEnteredByUser = 0;
    let result;
    let count = 0;

    if ($scope.posterImages.length > maxImagesinArr) { // Max 10 images array shift
      $scope.posterImages.shift();
    }
    if (!gifquery) { // if this is a user-entered value
      IsQueryEnteredByUser = 1;
      clockSpeak($scope.addedValue);
      addQueryToDataBase($scope.addedValue);

    }
    if ($scope.addedValue || gifquery) {
      let currentstring = $scope.addedValue;
      // console.log('inside ChangeTopic with value');
      if (gifquery) {
        currentstring = gifquery;
      }

      $.ajax({
        url: "https://api.giphy.com/v1/gifs/search?q=" + currentstring.replace(/%20/g, '+') + "&api_key=dc6zaTOxFJmzC",
        type: "GET",
        success: function (response) {

          let numOfImagesToAdd = response.data.length;

          if (numOfImagesToAdd > 0) {
            let randomURL = response.data[Math.floor((Math.random() * response.data.length))].images.fixed_width.url;
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
            if (IsQueryEnteredByUser)
              $scope.pushTopic(randomURL, $scope.addedValue, 'dd');
            $scope.addedValue = '';


            if (questionsHasQuestionBeenAnswered) {
              $scope.changeQuestion(1);
              questionsHasQuestionBeenAnswered = 0;
              questionsTimePast = 0;

            }
          } else {
            //no images found, enter some random value
            $scope.ChangeTopic('robot');

          }




        }
      });
    }
    // } else {
    //   // console.log('inside ChangeTopic no value');
    //   $scope.addedValue = '';
    //   for (var prop in $scope.topics) {
    //     if (Math.random() < 1 / ++count) {
    //       result = prop;
    //     }
    //   }
    //   $scope.currtopic = $scope.topics[result];
    //   $scope.posterImages.push({
    //     title: $scope.topics[result].title,
    //     src: $scope.topics[result].imgAddr,
    //     posterWidth: Math.floor((Math.random() * 220) + 100),
    //     topSpace: Math.floor((Math.random() * 150)),
    //     date: getCurrTime(),
    //     hour: $scope.metadata.dailytpoic
    //   });

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
    console.log('user enter!');
  }


  function clockSpeak(val) {
    //todo: speak
    let TTSmsg = new SpeechSynthesisUtterance(val);
    window.speechSynthesis.speak(TTSmsg);
  }




  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.8;


  $scope.drawClock = function () {
    // console.log('in DrawClock');
    let seed = Math.floor(Math.random() * 100) + 1;
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);
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
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));


    drawHand(ctx, hour * 3, radius * 0.5, 4);
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, 4);
    // second
    second = (second * Math.PI / 30);
    drawHand(ctx, second, radius * 0.9, 4);


    // console.log(((second * -1 )/6));
    // $scope.maincolor = 'fff';

  }

  function drawHand(ctx, pos, length, width) {
    if (isCrazy == true) {
      ctx.strokeStyle = "#ffffff";
    }
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }

  function drawNumbers(ctx, radius) {
    let ang;
    let num;
    ctx.font = radius * 0.15 + "px Simpler";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (num = 1; num < 5; num++) {
      ang = (num - 1) * Math.PI / 2;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.8);
      ctx.rotate(-ang);
      if (isCrazy == true) {
        ctx.fillStyle = '#ffffff';
      }
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
    ctx.fill();
    ctx.lineWidth = 4;
    if (isCrazy == true) {
      ctx.strokeStyle = "#ffffff";
    }
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