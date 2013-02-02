(function(){
	

	window.App = {
		Views: {}
	};


	App.Views.LogIn = Backbone.View.extend({

		el: "#log-in-screen",

		initialize:  function(){
			console.log(">> sign up initialize!");
		},

		events: {
			"click #submitLogIn" : "doLogIn",
			"click #submitSignUp": "doSignUp"
		},


		doSignUp: function(ev){
			console.log(">> sign up");
			ev.preventDefault();

			
			window.location = "index.html";
		},

		doLogIn: function(ev){
			ev.preventDefault();
		}
	});

	var logInView = new App.Views.LogIn();



})();