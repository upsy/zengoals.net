var Person = Backbone.Model.extend({
	defaults: {
		name: "John Doe",
		age: 30,
		occupation: "doctor"
	}
});

var PersonView = Backbone.View.extend({
	tagName: "div",

	template: _.template("<%= name %> (<%= age %>) - <%= occupation %>"),

	initialize: function  () {
		// console.log(this.model);
		this.model.bind("change",this.render,this);
		this.render();

	},

	render: function(){
		// console.log(">> render");
		this.$el.html( this.model.get("name"));
		// this.$el.html(this.template(this.model.toJSON()));
	}
});


var julica_person = new Person({name:"Julica"});
var personView = new PersonView({model: julica_person});


(function() {
	window.App = {
		Models : {},
		Views: {},
		Collections: {},
		Router: {}
	};

	
	App.Router = Backbone.Router.extend({
		routes: {
			'': 'index',
			'goal/edit/:id': 'editGoal',
			'goal/show/:id': 'showGoal',
			'goal': 'indexGoal'
		},

		index: function(){
			console.log(">> index of App");
		},

		editGoal: function(id) {
			console.log(">> edit goal: " + id);
		},

		showGoal:	function(id){
			console.log(">> show goal: " + id);
		},
		
		indexGoal:	function(){
			console.log(">> index Of Goal!");
		}

	});


	new App.Router();
	Backbone.history.start();
})();










































































