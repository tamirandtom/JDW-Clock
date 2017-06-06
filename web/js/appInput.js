var App = angular.module('clock', ['ngAnimate']);

App.controller('index', ['$scope', '$http', '$location', function ($scope, $http, $location) {

  var config = {
    apiKey: "AIzaSyCc04tscd1bx3BQR21UnCtBJA6RlTHzYiY",
    authDomain: "clock-2517a.firebaseapp.com",
    databaseURL: "https://clock-2517a.firebaseio.com",
    projectId: "clock-2517a",
    storageBucket: "clock-2517a.appspot.com",
    messagingSenderId: "562231687355"
  }; 
  firebase.initializeApp(config);


  $scope.onSubmitClick = function () {
            firebase.database().ref('clockstart/start').set(1);
  }

  var dbObjTopicsRef = firebase.database().ref('topisobj');
  dbObjTopicsRef.on('value', function (snapshot) {
    if (snapshot.val()) {
      $scope.topics = snapshot.val();
      // console.log($scope.topics);
      // $scope.ChangeTopic();
      $scope.$apply();

    }
  });


  $scope.removeTopic = function(key){
    // console.log(key);
              firebase.database().ref('topisobj/'+key).remove();
  }

  $scope.pushTopic = function () {

    var topicStr = $('#topicinput').val();

      $.ajax({
        url: "https://api.giphy.com/v1/gifs/search?q=" + topicStr.replace(/%20/g, '+') + "&api_key=dc6zaTOxFJmzC",
        type: "GET",
        success: function (response) {

          // Updates object to contain all new images
          var updates = {};

          // Add maximum of 10 new images
          var numOfImagesToAdd = response.data.length;
          if (numOfImagesToAdd > 10) numOfImagesToAdd = 10;
          for (i = 0; i < numOfImagesToAdd; i++) {
            currdate = Date.now();
            console.log(currdate);
            var objkey = firebase.database().ref().child('topisobj').push().key; // New key for object
            // Creating the data OBJ
            var topicData = {
              title: topicStr,
              imgAddr: response.data[i].images.fixed_width.url,
              date: currdate,
              key: objkey
            };
            updates['/topisobj/' + objkey] = topicData;
          }
          firebase.database().ref().update(updates);
        }
      });
  }
}]);