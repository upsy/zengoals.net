

(function(){
	
/*
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
|	Global vars
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
*/
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Router : {}
	};

	var vent = _.extend({},Backbone.Events);

	/* expose vent to global console .. */
	App.vent = vent;



/*
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
|	0. MODEL USER
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
*/

	App.Models.User = Backbone.Model.extend({
        
        defaults : function(){
            return {
            };
        },

		idAttribute: "id",
       
		initialize: function(){
			vent.bind("login:check", this.checkLogin, this);
		},

		checkLogin: function( userData_obj ){
			if ( userData_obj.logged_str ){
				this.id = userData_obj.id;
				this.fetch();
			}
		},

		urlRoot: serverPath + "/user"

	});



	App.user = new App.Models.User();


/*
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
|	1. Check for logg in?!
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
*/

	checkLogin();


	function checkLogin(){
		$.get('inc/api/user_test_logged_in',{},function(data){
			var data_obj = JSON.parse(data);

			console.log(">>> server answered ;) " + data);
			vent.trigger("login:check", data_obj);
		});
	}


	/*
	|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
	|	2. Screen Manager
	|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
	*/

	App.Views.ScreenManager = Backbone.View.extend({

		initialize: function  () {
			this.test = "alpha";
			console.log(">> initialize le wild ScreenManager!");
			vent.bind("login:check", this.checkLogin, this);
			vent.bind("login:done", this.doAfterLogIn, this);
		},


		/** triggered by login:check */
		checkLogin: function( userData_obj ){
			var userLogged_str = userData_obj.logged_str;
			console.log(">> checkLogin l:" + userLogged_str);

			if (userLogged_str.toLowerCase() == "false"){
				console.log(">> why u no change page?");
				window.location = "login.html";
			} else {
				vent.trigger("login:done", true);
			}
		},

		/** triggered by login:done */
		doAfterLogIn: function( isSucces_bool ){

			if ( isSucces_bool ){
				var uStatus_str = this._getUserStatus();
				console.log(">> go to pick screen! "+ uStatus_str);
				switch ( uStatus_str ) {
					case "first":

						vent.trigger("mainView:gotoScreen", "pickGoalsScreen");
						break;
					case "":
						vent.trigger("mainView:gotoScreen", "welcomeScree");
						break;
					default:

				}
			}
		},

		_getUserStatus: function(){
			var status_str = "";

			$.when( App.user.fetch ).then(
				// success
				function(){
					console.log (">> user is fetching..");
					status_str = App.user.get("status");
					return status_str;
				},

				// error
				function(){
					console.log( ">> [_getUserStatus] error on fetch deffered ..  for status" );
				});
		
			
		}




	});



	ScreenManager = new App.Views.ScreenManager();


})();