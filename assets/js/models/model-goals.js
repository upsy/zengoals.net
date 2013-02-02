if (window.App === undefined){
    window.App = {};
}

if (App.broadcastManager === undefined){
    App.broadcastManager = _.extend({},Backbone.Events);
}

App.GoalModel = Backbone.Model.extend({
    defaults : function(){
        return {
            goal_name: '',
            goal_score:{
                professional: "0",
                social: "0",
                personal: "0"
            }
        };
    },
    idAttribute: "id",
        
    validate: function(attrs){
        // if (attrs.goal_title === ''){
        //     return {error_desc:"ERROR: Goal must not be empty!"};
        // }
        
        // if (attrs.goal_title.length < 3){
        //     return {error_desc:"ERROR: Goal must be at least a few words long!"};
        // }
    },
        
    initialize: function(){
    },
        
    clear: function() {
        this.destroy();
    },
        
    urlRoot: serverPath + "/goal"
        
});
    
App.GoalsList = Backbone.Collection.extend({
    model: App.GoalModel,
        
    initialize: function(){
    }
});
    

