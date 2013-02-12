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

			var loginUrl = serverPath + "/user_login";

			$.getJSON(loginUrl,
					  {
					    userEmail: $('#inputEmail').val() ,
					    userPass: $('#inputPassword').val(),
					  },

					  function(data) {
					  		console.log(data);

					  		if (data.success == 'true'){
					  			window.location = 'app.html';
					  		}
					  		else {
					  			// ii dam o notificare ca e fraier si nu stie a se loga ;D
					  		}
					  });

		}
	});

	var logInView = new App.Views.LogIn();



})();