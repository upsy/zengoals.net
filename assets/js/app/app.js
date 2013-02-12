

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

	window.Utils = {

		centerScreens: function() { /* go through all $screens_arr = $(".screen"); and fix vertical position with margin-top */
			var $screens_arr = $(".screen");
			
			$.each($screens_arr, function(index, screen) { /* get the jquery object from the DOM one */
				var $screen = $(screen); // <=> jQuery(screen)
				
				/* calculate the height and the new ypos for aligning in the middle */
				var screenHeight = $screen.height();
				var ypos = ($(window).height() - screenHeight) / 2;

				/* set the margin-top to be ypos if it can be centered */
				if(ypos > 0) {
					$screen.css("margin-top", ypos);
				} else {
					$screen.css("margin-top", 0);
				}
			});
		}
	};

	Utils.centerScreens(); // on init center screens;
        
    
	$(window).on("resize",function(){
		Utils.centerScreens();
	});


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
			//console.log( "?> user checkLogin for ",userData_obj);
			if ( userData_obj.logged_str.toLowerCase() == "true" ){
				
				var that = this;

				this.id = userData_obj.id;
	
				this.fetch({
					success: function(){
						//console.log(">> user loaded ev!" + that);
						vent.trigger("user:loaded", that);
					},

					error: function(){

					}
				});
			}
		},

		urlRoot: serverPath + "/user"

	});



	App.Models.Goal = Backbone.Model.extend({

		getTotalScore: function(){
			var totalScore = 0;

			var scoreProfessional = this.get("scoreprofessional");
			var scorePersonal = this.get("scorepersonal");
			var scoreSocial = this.get("scoresocial");

			var userProfessional = App.user.get("scoreprofessional");
			var userPersonal = App.user.get("scorepersonal");
			var userSocial = App.user.get("scoresocial");

			totalScore = scoreProfessional * userProfessional/100 + scorePersonal * userPersonal/100 + scoreSocial * userSocial/100;
			return totalScore;
		}
	});

	App.Collections.Goals = Backbone.Collection.extend({
		model: App.Models.Goal,

		initialize: function(){
			vent.bind("user:loaded",this.fetchMeSome,this);
		},

		fetchMeSome: function(){
			this.fetch();
		},

		url: function( ){
			return serverPath + "/user/" + App.user.id + "/goals";
		},

		comparator: function(model){
			return -model.getTotalScore();
		},

		save: function( options ){

			_.each(this.models,function(model,index){
				console.log(">> each ", model.toJSON());
				model.save();
				//TODO: create an algorithm to save only updated objects: 	If you want to save a list of the attributes that changed and have that list persist, create a handler for the changed event where you do something like this.previousChangedAttrs = this.changedAttributes(). Then you can check previousChangedAttrs any time you like. Keep in mind that the change event fires every time you call set() without the silent option, so multiple calls to set will reset previousChangedAttrs. If you want you can create an array and track a history of changes. Makes me think about rolling my own client-side undo system... – Mike Johnson Feb 21 '12 at 16:50
				// http://jsfiddle.net/ambiguous/8PQh9/
				//http://stackoverflow.com/questions/10220631/how-can-i-get-a-list-of-models-from-the-collection-that-have-changes-since-const/10221162#10221162
			});

			var success;
			if (options.success){
				success = options.success;
				success();
			}

		}
	});

	App.user = new App.Models.User();
	App.goals = new App.Collections.Goals();



/*
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
|	1. Check for logg in?!
|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
*/


	function checkLogin(){
		$.get('inc/api/user_test_logged_in',{},function(data){
			console.log(data);
			var data_obj = JSON.parse(data);

			//console.log(">>> server answered ;) " + data);
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
			//console.log(">> initialize le wild ScreenManager!");
			vent.bind("login:check", this.checkLogin, this);
			vent.bind("user:loaded", this.doAfterUserLoaded, this);
		},


		/** triggered by login:check */
		checkLogin: function( userData_obj ){
			var userLogged_str = userData_obj.logged_str;
			//console.log(">> checkLogin l:" + userLogged_str);

			if (userLogged_str.toLowerCase() == "false"){
				console.log(">> why u no change page?");
				window.location = "login.html";
			} else {
				vent.trigger("login:done", true);
			}
		},

		/** triggered by login:done */
		doAfterUserLoaded: function( isSucces_bool ){

			if ( isSucces_bool ){
				var uStatus_str = this._getUserStatus();
				
				//console.log (">> uStatus_str = " + uStatus_str);
				//console.log( App.user.attributes );
				
				switch ( uStatus_str ) {
					case "newly_created":
						vent.trigger("ScreenManager:gotoScreen", "pickGoalsScreen");
						break;
					case "":
						vent.trigger("ScreenManager:gotoScreen", "welcomeScreen");
						break;
					default:

				}
			}
		},

		_getUserStatus: function(){
			var status_str = "";
			status_str = App.user.get("status");
			return status_str;
		}
		
	});


	/*
	|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
	|	PICK GOAL SCREEN
	|––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
	*/

	/* Once user has logged in and status == "newly_created" we send him to this PickGoalsScreen */
	App.Views.PickGoalsScreen = Backbone.View.extend({

		el: "#pick_screen",

		initialize: function  () {
			//console.log(">> welcome to the PickGoalsScreen!");
			
			vent.bind("ScreenManager:gotoScreen",this.checkScreen,this);
			
			App.goals.on("reset", this.refresh, this);
			
			vent.bind("GoalView_PickScreen:clickGoal", this.refreshAvailabeSlots, this);
			
			this._hideContinue();			
			//App.goals.on("add")
		},

		events: {
			"click #pick_screen_continue_btn": "clickedContinue"
		},

		/* gets called each time a screen is changed.. check if I shoud refresh */
		checkScreen: function ( screenType_str ){
			console.log(">> checkScreen " + screenType_str);
			if (screenType_str === 'pickGoalsScreen'){
				this._showSelf();
			}
		},

		render: function  () {
			return this;
		},

		clickedContinue: function(){
			console.log(" >> continue");
			App.goals.save({success: function(){
				console.log(" >> saved.. should move to diff screen");	
			}})
		},

		/* on App.goals update from db + on showSelf*/
		refresh: function () {
			var that = this;

			//clear previous list.. if exits
			that.$el.find("#pick_screen_goals_holder").html("");
			
			//console.log(">> GOT THE GOALS.. BUILD HTML!",App.goals.toJSON());
			
			App.goals.each(function(goalModel,index){
				var goalView = new App.Views.GoalView_PickScreen({model: goalModel});
				that.$el.find("#pick_screen_goals_holder").append(goalView.render().el);
			});

			that._reorderByScore();
			that.refreshAvailabeSlots();
		},

		/* called when refresh happens (collection:reset) or someone picks a new goals ... or a goal is completed! */
		refreshAvailabeSlots: function(){
			var selectedGoals_nr = this.$el.find("input:checkbox:checked").length;

			var totalAvailableSlots = App.user.get("availableslotsgoals");
			var availableSlots = totalAvailableSlots - selectedGoals_nr;

			if (availableSlots <= 0 ) {
				availableSlots = 0;
				//vent.trigger("PickGoalsScreen:noSlotsAvailable");
				this.$el.find("input.check:checkbox").attr('disabled','true');
				this.$el.find("input.check:checkbox:checked").removeAttr('disabled');

				this._showContinue();

			} else {
				this.$el.find("input.check:checkbox").removeAttr('disabled');

				this._hideContinue();
				//vent.trigger("PickGoalsScreen:slotsOpen");
			}

			this.$el.find(".available_slots").html( availableSlots );
			this.availableSlots = availableSlots;
		},

		_showSelf: function (){
			console.log(">> welcome to the PickGoalsScreen!");
			this.$el.fadeIn(300);
		},


		_reorderByScore: function  () {
			
		},

		_showContinue: function(){
			var $footer = this.$el.find("#pick_screen_goals_module .footer");
			$footer.fadeIn(300);
			Utils.centerScreens(); 
		},

		_hideContinue: function(){
			var $footer = this.$el.find("#pick_screen_goals_module .footer");
			$footer.hide();
			Utils.centerScreens(); 
		}
	});
 
	
	/** GOAL VIEW **/
	App.Views.GoalView_PickScreen = Backbone.View.extend({
		tagName: 'li',
		className: 'goal_pickScreen',
		template: _.template($('#tmpl_goal_pickScreen').html()),

		initialize: function(){

		},

		events: {
			"click input": "toggleCheckbox"
		},

		render: function(){
            // Load the compiled HTML into the Backbone "el"
            var checked_bool = false;

            if (this.model.get("status") === "active"){
				checked_bool = true;
            }

            var data = {
				name : this.model.get("name"),
				totalScore: Math.round(this.model.getTotalScore()),
				checked_bool: checked_bool

            };
			
			this.$el.html( this.template( data ) );
			
			return this;
		},

		toggleCheckbox: function (){
			//console.log(' >> clicked checkbox...');
			
			var checked_nr = this.$el.find("input:checkbox:checked").length;

			if (checked_nr == 1){
				this.model.set({"status":"active"});
				this.$el.find(".title").addClass("selected");

			} else {
				this.model.set({"status":"newly_created"});
				this.$el.find(".title").removeClass("selected");
			}

			//console.log(">> checked_nr =" + checked_nr);
			vent.trigger("GoalView_PickScreen:clickGoal");

		}
	});

	

	App.pickGoalsScreen = new App.Views.PickGoalsScreen();














	ScreenManager = new App.Views.ScreenManager();
	
	checkLogin();




})();