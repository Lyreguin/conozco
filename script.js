var config = {
	apiKey: "AIzaSyBT1BopiYEPs2ztZxep9Q8fu_IxPiJd0j0",
	authDomain: "conozco-1358.firebaseapp.com",
	databaseURL: "https://conozco-1358.firebaseio.com",
	storageBucket: "conozco-1358.appspot.com",
};
firebase.initializeApp(config);

var app = angular.module("ConozcoApp", ["ngRoute","firebase", "angular.filter"]);

app.filter('keylength', function(){
  return function(input){
  	if(!angular.isObject(input)){
      return 0;
    }
    return Object.keys(input).length;
  }
});


var currentUserToken = "";

var currentUser = "";
var currentToken = "";



// ROUTE CONFIGURATION

app.config(function($routeProvider){


	$routeProvider.when ("/", {
		templateUrl: "templates/login.html",
		controller: "login_controller"
	})

	$routeProvider.when("/profile", {
		templateUrl: "templates/profile.html",
		controller: "profile_controller"
	})

	$routeProvider.when("/work", {
		templateUrl: "templates/feed_work.html",
		controller: "workfeed_controller"
	})

	$routeProvider.when("/general", {
		templateUrl: "templates/feed_general.html",
		controller: "generalfeed_controller"
	})

	$routeProvider.when("/admin", {
		templateUrl: "templates/admin.html",
		controller: "admin_controller"
	})

});

// LOGIN_CONTROLLER

app.controller('login_controller', function($scope, $firebaseAuth, $location, $firebaseObject) {
	var auth = $firebaseAuth();

	auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.displayName);
			$scope.loggedIn = true;
		} 
		else {
			console.log("Not Signed In");
			$scope.loggedIn = false;
		}
	});

	$scope.signIn = function() {
		auth.$signInWithPopup("google").then(function(result) {
			var ggUser = result.user;
			var ref = firebase.database().ref().child("Users").child(ggUser.uid);
			var user = $firebaseObject(ref);

			user.uid = ggUser.uid;
			user.email = ggUser.email;
			user.name = ggUser.displayName;
			user.$save().then(function(){
				console.log("User Saved");
			});


		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});

	}

	$scope.signOut = function(){
		$location.path("/")
		auth.$signOut()
			}

	$scope.workLink = function(){
		$location.path("/work")
	}
	$scope.genLink = function(){
		$location.path("/general")
	}
	$scope.profLink = function(){
		$location.path("/profile")
	}

});
// PROFILE_CONTROLLER

app.controller('profile_controller', function($scope, $http, $firebaseArray, $location, $firebaseAuth){
	var auth = $firebaseAuth();

	auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.displayName);
			$scope.fireUser = firebaseUser;
			$scope.firstName = firebaseUser.displayName.split(' ')[0];
		} 
		else {
			console.log("Not Signed In");
			$location.path("/");
		}
	});

	
	function rebindHovers() {
		$('.default_display').mouseover(function(){
			$(this).find('.hover_display').css('display','block');
		});

		$('.default_display').mouseout(function(){
			$(this).find('.hover_display').css('display','none');
		});
	}

	
	// EMPLOYEE ONBOARDING 
	var employeeRef = firebase.database().ref().child("employees");
	$scope.employees = $firebaseArray(employeeRef);
	$scope.newEmployee = {};

	$scope.employees.$watch(function() {
	  	setTimeout(function(){ 
	  		rebindHovers();
	  	}, 1000);
  	});
  	
	
	$scope.addEmployee = function (){
		$scope.employee.$add($scope.newEmployee);
	}; 



 });
 

	// PROFILE IMAGE & PEDIGREE SWAP OUT FUNCTION
	// $('.default_display').mouseover(function(){
	// 	$(this).find('.hover_display').css('display','block');
	// });

	// $('.default_display').mouseout(function(){
	// 	$(this).find('.hover_display').css('display','none');
	// });


	// ON CLICK FUNCTION FOR MOBILE DESIGN
	// $('.default_display').click(function(){
	// 	if ($(this).find('.hover_display').css('display') === "none"){
	// 		$(this).find('.hover_display').css('display', 'block')
	// 	} else {
	// 		$(this).find('.hover_display').css('display', 'none');
	// 	}
	// });

// END OF CONTROLLER - LEAVE IMAGE UPLOAD CODE OUTSIDE CONTROLLER

// WORKFEED_CONTROLLER

app.controller('workfeed_controller', function($scope, $http, $firebaseAuth, $firebaseArray, $location){
	var auth = $firebaseAuth();

	auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.displayName);
			$scope.fireUser = firebaseUser;
			$scope.firstName = firebaseUser.displayName.split(' ')[0];
		} 
		else {
			console.log("Not Signed In");
			$location.path("/");
		}
	});

	// START OF API SETUP WITH ANGULAR
 

		$http({
  		method: 'POST',
  		url: 'https://twinword-sentiment-analysis.p.mashape.com/analyze/',
  		headers: {"X-Mashape-Key": "IU5RDQiu0omshnKfW2nXe6Qe891Hp16W0Vjjsnwn8zDAeD07gY","Accept": "application/json",},
  		data: {
  			text: $scope.newAnnouncement, //???
  			}
		}).then(function successCallback(response) {
			console.log('checking post');
			console.log(response);
			console.log ($scope.newAnnouncement);
  		  // this callback will be called asynchronously
    		// when the response is available
  		}, function errorCallback(response) {
    	alert("Sorry, there has been an error with your announcement. Please try to post again. ")
 		});

 		$http({
  		method: 'GET',
  		url: 'https://twinword-sentiment-analysis.p.mashape.com/analyze/',
  		headers: {"X-Mashape-Key": "IU5RDQiu0omshnKfW2nXe6Qe891Hp16W0Vjjsnwn8zDAeD07gY","Accept": "application/json",},
		}).then(function successCallback(response) {
			console.log('checking get');
  		  // this callback will be called asynchronously
    // when the response is available
  		}, function errorCallback(response) {
    	alert("Sorry, there has been an error with your announcement. Please try to post again. ")
 		});

	// END OF SENTIMENT STUFF

	var feedRef = firebase.database().ref().child("work_feed");
	$scope.announcements = $firebaseArray(feedRef);
	$scope.newAnnouncement = {};
	$scope.newComment ={};
	
	

	$scope.postAnnouncement = function (){
		$scope.newAnnouncement.postName = $scope.fireUser.displayName;
		$scope.newAnnouncement.postPic = $scope.fireUser.photoURL;
		$scope.newAnnouncement.postDate = "";
		$scope.announcements.$add($scope.newAnnouncement);
		$scope.newAnnouncement = {};
	};

	$scope.postComment = function (announcement) {
		var commentsRef = firebase.database().ref("work_feed/"+announcement.$id).child('comments');
		commentsRef.push().set($scope.newComment);
		$scope.newComment={};
	};



	//SCORE COUNTER TOOL WHICH WORKS

	// $scope.score = 0;

	// $scope.onClick = function() {	
	// $scope.score += 1;
	// console.log($scope.score);
	// };

	//NOW TRYING TO SAVE TO FIREBASE
	//console.log($scope.announcements);
	$scope.score = 0;

	$scope.onClick = function(announcement) {	
		var scoreRef = firebase.database().ref('work_feed/'+announcement.$id).child('scores');
		scoreRef.push().set($scope.score);
	};
	
	$scope.workLink = function(){
		$location.path("/work")
	}
	$scope.genLink = function(){
		$location.path("/general")
	}
	$scope.profLink = function(){
		$location.path("/profile")
	}



});

// GENERALFEED_CONTROLLER

app.controller('generalfeed_controller', function($scope, $http, $firebaseAuth, $firebaseArray, $location){
	var auth = $firebaseAuth();

	auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.displayName);
			$scope.fireUser = firebaseUser;
			$scope.firstName = firebaseUser.displayName.split(' ')[0];
		} 
		else {
			console.log("Not Signed In");
			$location.path("/");
		};
	});

	var feedRef = firebase.database().ref().child("general_feed");
	$scope.announcements = $firebaseArray(feedRef);
	$scope.newAnnouncement = {};
	$scope.newComment ={
		text: ""
	};

	$scope.postAnnouncement = function (){
		$scope.newAnnouncement.postName = $scope.fireUser.displayName;
		$scope.newAnnouncement.postPic = $scope.fireUser.photoURL;
		$scope.newAnnouncement.postDate = "";
		$scope.announcements.$add($scope.newAnnouncement);
		$scope.newAnnouncement = {};
	};

	$scope.postComment = function (announcement) {
		var commentsRef = firebase.database().ref("general_feed/"+announcement.$id).child('comments');
		commentsRef.push().set($scope.newComment);
		$scope.newComment={};

	};
	
	$scope.workLink = function(){
		$location.path("/work")
	}
	$scope.genLink = function(){
		$location.path("/general")
	}
	$scope.profLink = function(){
		$location.path("/profile")
	}

});

// ADMIN_CONTROLLER

app.controller('admin_controller', function($scope, $http, $firebaseAuth ,$firebaseArray, $location) {
	var auth = $firebaseAuth();

	auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.displayName);
		} 
		else {
			console.log("Not Signed In");
			$location.path("/");
		}
	});

	var employeeRef = firebase.database().ref().child("employees");
	$scope.employee = $firebaseArray(employeeRef);

	$scope.newEmployee = {};
	
	$scope.addEmployee = function (){
		$scope.employee.$add($scope.newEmployee);
	};

});