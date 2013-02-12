
window.App = App || {};
window.Utils = {};

Utils.uniqueArray = function (array){
    return $.grep(array,function(el,index){
        return index == $.inArray(el,array);
    });
};

Utils.showWarning = function(str,$parent){
    console.log(">>ERROR: "+str);
    var $warning = $parent.find(".warning");
    $warning.html('<div class="alert alert-error">'+str+"</div>");
};

$(document).ready(function(){
    console.log("HELLO WORLD!");
    
    
   App.broadcastManager = App.broadcastManager ||  _.extend({},Backbone.Events);
   
    
    var $screens_arr = $(".screen");
    var currentStep = 0;
    
    centerScreens(); // on init center screens;
        
    
    $(window).on("resize",function(){
        centerScreens();
    });
    
    
    /* show first #home-intro screen on start! */
    showStepScreen(currentStep);                // currentStep = 0;
    
    $(".next-screen").on("click",function(ev){
            ev.preventDefault();
            
            if (showStepScreen(currentStep+1)){
                currentStep ++;
            }
    });
    
    
     /*
     * Util Functions ..
     */
    
    /* */
    function showStepScreen(givenStep){
        
        /* find out the $screen for the givenStep index */
        var $currentScreen = $($screens_arr.get(givenStep));
  
        /* check if the 'active' screen can be switched! */
        var $activeScreen = $screens_arr.filter(".active");
        
        if (checkValidation($activeScreen)){
            
            /* remove "active" class and make all invisible with display:none; */
            $screens_arr.removeClass("active");
            $screens_arr.css("display","none");
            
            /* show new screen and set it "active" */
            $currentScreen.addClass("active").fadeIn(333);
            return true;
        } /* <- endif */
        else return false;

    } /* <- end function */
    
    
    
    
    App.showStepScreen = showStepScreen;
    
    /* Center all elements with class .screen on middle! vertically */
    function centerScreens(){
        
        /* go through all $screens_arr = $(".screen"); and fix vertical position with margin-top */
        $.each($screens_arr,function(index, screen){
            /* get the jquery object from the DOM one */
            var $screen = $(screen); // <=> jQuery(screen)
            
            /* calculate the height and the new ypos for aligning in the middle */
            var screenHeight = $screen.height();
            var ypos = ($(window).height() - screenHeight)/2;
            
            /* set the margin-top to be ypos if it can be centered */
            if (ypos > 0){
                $screen.css("margin-top",ypos);
            } else {
                $screen.css("margin-top",0);
            }
        });
    }
    
    /* Take current activeScreen and check it! */
    function checkValidation($activeScreen){
        //console.log($activeScreen);
        var activeID = $activeScreen.attr("id");
        console.log(activeID);
        switch (activeID){
            case "start-step2-goals":return checkGoals();
            break;
            default:
            break;
        }
        return true;
    }
    
    
    function checkGoals(){
        var $textareaGoals = $("#form-goals-textarea");
        var userGoals_txt = $textareaGoals.val();
        
        createUserGoals(userGoals_txt);
        
        if ( App.userGoals.length >= 1 ){
            App.goalAnalyzer.showGoal(0);
            return true;
        }
        else {
            var $parent = $("#start-step2-goals");
            Utils.showWarning("ERROR: No goals coud be created! Please use at least a few words per goal!",$parent);
            return false;
        }
    }
    
    
    function createUserGoals(entered_str){
        
        /* break entered_str text into lines */
        var lines_arr = entered_str.split(/\n/);
        //lines_arr = $.unique(lines_arr);
        lines_arr = Utils.uniqueArray(lines_arr);
        
        /* for each line define a new GoalModel */
        $.each(lines_arr,function(index,line_str){
            if (line_str.length > 3){
                var userGoal = new App.GoalModel({goal_name: line_str});

                 App.userGoals.add(userGoal);
            }
            /* and add set goal to the list */
           
            
        });
        
        console.log(App.userGoals);
        
    }
    
    
    App.GoalAnalyzer = Backbone.View.extend({
         el: $("#start-step3-analyze"),
         
        initialize: function(){
            this.nr = 0;
            this.$goalDivs_arr = [];
            this.currentGoal = 0;
            this.start_bool = false;
            this.$nextControl =  $("#next-goal");
            this.$prevControl = $("#prev-goal");
            this.$nextScreenBtn = $("#next-screen-step3");
            App.userGoals.bind('add', this.addOneGoal, this);
            App.broadcastManager.bind('saveGoalsForUser',this.saveGoalsForUser,this);
        },
        
        events: {
            "click #next-goal": "goToNextGoal",
            "click #prev-goal": "goToPrevGoal"
        },
        
        checkControls: function(){
            if (this.currentGoal === 0){
                this.$prevControl.addClass("disabled");
            } else {
                this.$prevControl.removeClass("disabled");
            }
            
            if (this.currentGoal == this.$goalDivs_arr.length-1){
                this.$nextControl.addClass("disabled");
                this.$nextScreenBtn.removeClass("hidden2");
            } else {
                 this.$nextControl.removeClass("disabled");
                 this.$nextScreenBtn.addClass("hidden2");
            }
        },
        
        goToNextGoal: function(){
            if  (this.$nextControl.hasClass("disabled")) return;
            console.log(">> go to next goal");
            this.currentGoal ++;
            this.showGoal(this.currentGoal);
        },
        
        goToPrevGoal: function(){
            if ( this.$prevControl.hasClass("disabled")) return;
            this.currentGoal --;
            this.showGoal(this.currentGoal);
            console.log(">> go to prev goal");
        },
        
        
        
        render: function(){
        
        },
        
        showGoal:function(id){
            this.checkControls();
            
            var $goalDiv = $(this.$goalDivs_arr[id]);
            
            console.log(">> SHOW GOAL BELLOW:");
            console.log($goalDiv);
            
            this.$goalDivs_arr.removeClass("active_goal");
            $goalDiv.addClass("active_goal");
            centerScreens();
        },
        
        addOneGoal: function(goalModel,collection){
            console.log("S-a triggered un add -> nou element de creat vizual! :"+" " + goalModel.get("goal_name"));
            this.nr ++;
            var goalView = new App.GoalView({model: goalModel, nr: this.nr});
            this.$("#analyzer-goals-holder").append(goalView.render().el);
            this.$goalDivs_arr = $(".goal_view");
            

        },

        saveGoalsForUser: function(received_user_id){
            var successfull_nr = 0;
            console.log(">> save goals for the user_id:"+ received_user_id);
            App.userGoals.each(function(goalModel,index){
                // scores = {};
                // scores.professional = ..;
                // scores.personal = ..;
                // scores.soscial = ..;

                // goalModel.set({goal_score: scores});
                goalModel.url = serverPath + "/goals"+ "/"+received_user_id;
                
                console.log(">> SAVE NEW GOAL TO SERVER: ");
                console.log(goalModel);

                goalModel.save({},{
                  wait:true,
                  success: function(model,response){
                      console.log(">> Success, saved new goal for user_id:"+received_user_id);
                      console.log(response);
                      
                      successfull_nr ++;
                      
                      /* Check if this is the last goal succesfully saved! If it is go to app.html */ 
                      if (successfull_nr ==  App.userGoals.length){
                        window.location = "app.html";
                      }
                  },
                  error: function(model,response){
                      console.log(">> ERROR at save goal for user_id:"+ received_user_id);
                      console.log(response);
                  }
                });
            });
        }
            
         
    });
    
    App.UserScoresAnalyzer = Backbone.View.extend({
          el: $("#start-step4-user-scores"),
            
          initialize: function(){
            var that = this;
            var availablePoints,
                maxPoints = 100;
           
            that.colors_arr = ['red','blue','yellow','green'];
            that.currColor = 0;
            
            that.currSpinIndex = 0;

            that.values_arr = [['Professional',0], ['Personal',0], ['Social',0], ['Available',100]];
            console.log(typeof(that.values_arr));
            that.updateDonutChart();
           
            $( ".spinner" ).spinner({
                create: function( event, ui ){
                    var myFocusBox = "<div class='focus-box'></div>";
                    
                    var myColor = that.colors_arr[that.currColor];
                    that.currColor ++;
                    
                    this.index = that.currSpinIndex;
                    that.currSpinIndex ++;
                    
                    this.$myFocusBox = $(myFocusBox);
                    
                    this.$myFocusBox.appendTo("#focus-bar-holder");
                    this.$myFocusBox.css("background-color",myColor);
                },
                
                spin: function( event, ui ) {
//                    var $this = $(this);
//                    var currValue = 0;
//                    if ($this.val()) currValue = $this.val();
//                    var diff =  currValue - ui.value;
//                    console.log("this.val = " + $this.val() + " diff ="+diff);
//                    availablePoints = maxPoints - that.checkAvailPoints(diff);
//                    if ( availablePoints < 0 ) {
//                        return false;
//                    } else
                      console.log(">>SPIN* HAPPENED! val = "+ ui.value);
                    
                    if ( ui.value < 0 ) {
                        return false;
                    }
                    
                    if (ui.value === undefined){
                        return false;
                    }
                },
                
                change: function(event, ui){
                    var $this = $(this);
                    var currValue = $this.val();
                    if (isNaN(currValue)) $this.val(0);
                    var max =  that.getMaxAvailablePoints(currValue);
                    if (max < currValue ) $this.val(max);
                    this.$myFocusBox.width($this.val()*4);
                    
                    that.values_arr[this.index][1] = Number($this.val());
                    
                    that.updateAvailablePoints();
                                       
                    that.updateDonutChart(that.values_arr);
                    
                },
                
                stop: function(event, ui){
                    var $this = $(this);
                    var currValue = $this.val();
                    var max =  that.getMaxAvailablePoints(currValue);
                    if (max < currValue ) $this.val(max);
                    this.$myFocusBox.width($this.val()*4);
                    that.updateAvailablePoints();
                    
                    that.values_arr[this.index][1] = Number($this.val());
//                    console.log('this.val = '+typeof(currValue));
                    that.updateDonutChart(that.values_arr);
                },
                
                min: 0,
                max: 100,
                step: 1,
                start: 0,
                numberFormat: "n"
            }); // <-- end $().spinner();
          }, // <-- end initialize: function(){..}
          
          getMaxAvailablePoints: function(currValue){
              var sum = this.getCurrentSum();
              var theOthers = sum - currValue;
              var max = 100 - theOthers;
              return max;
          },
          
          getCurrentSum: function(){
              var sum = 0;
              
              $.each($(".spinner"), function(index, spinner){
                  var $spinner = $(spinner);
                  sum += Number($spinner.val());
              });
                           
              return sum;
          },
          
          updateAvailablePoints: function(){
                var sum = this.getCurrentSum();
                var avPoints = 100 - sum;
                 
                if (!isNaN(avPoints)) {
                    this.$el.find("#available-points").html(avPoints);
                    this.values_arr[3][1] = avPoints;
                    if (avPoints === 0){
                        this.setNextStepVisibility("show");
                    } else {
                        this.setNextStepVisibility("hide");
                    }
                }
          },
          /**
           * Function will trigger Next Step button visibility when avPoints = 0
           * @param {string} show_str "show" / "hide"
           *
           */
          setNextStepVisibility: function(show_str){
            var $nextScreenBtn = this.$el.find("#next-screen-step4");

            if (show_str === "show"){
                $nextScreenBtn.removeClass("hidden2");
                // scroll to the bottom of the page!
                $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            } else {
                $nextScreenBtn.addClass("hidden2");
            }
          },
          
          updateDonutChart: function() {
              console.log(this.values_arr);
              $("#chartdiv").html('');
              $.jqplot('chartdiv', [this.values_arr],
                  {
                  seriesDefaults: {
                  // make this a donut chart.
                  renderer:$.jqplot.DonutRenderer,
                  rendererOptions:{
                      // Donut's can be cut into slices like pies.
                      sliceMargin: 3,
                      // Pies and donuts can start at any arbitrary angle.
                      startAngle: -90,
                      showDataLabels: true,
                      // By default, data labels show the percentage of the donut/pie.
                      // You can show the data 'value' or data 'label' instead.
                      dataLabels: 'value',
                      shadow: false
                  }
                  },
                  seriesColors: ['red','blue','yellow','#ccc'],
                  grid: {background: 'white', shadow: false},
                  legend: { show:true, location: 'e' }
                  }
              );
              centerScreens();
              
          },
          
          render:{
              
          },
          
          events:{
              
          }
      });
          
    
    App.GoalView = Backbone.View.extend({
        tagName: "div",
        className: "goal_view",
        
        template: _.template($('#goal_view-template').html()),
        
         initialize: function(){
            this.model.bind('change',this.render,this);
            this.model.bind('destroy',this.remove,this);
        },
        
        render: function(){
            var template_data = {
                ID: this.model.id,
                goal_number: this.options.nr,
                goal_title: this.model.get("goal_name")
            };
            this.$el.html(this.template({data:template_data}));
            var my_goal_model = this.model;
            
            this.$el.find(".slider").slider({
                range: "min",
                min: 1,
                max: 100,
                slide: function(event, ui){
                    var $this = $(this),
                        score_name = $this.attr("data-score_name");

                    var goal_score = my_goal_model.get("goal_score");
                    goal_score[score_name] = ui.value;
                    my_goal_model.set("goal_score",goal_score,{silent: true});
                    //my_goal_model.set(score_name, ui.value, {silent: true});
                    //console.log('score_name = ' + score_name + ' ui.value = ' + ui.value);
                    
                    $this.next().html( ui.value );
                    
                    //var $parent = $this.parent().parent();
                    //console.log($parent);
                }
                
            });
            
            return this;
        }
        
    });
    
    
    


    /**
     * Manage step5
     * @type {[type]}
     */
    
    App.UserModel = Backbone.Model.extend({
        defaults : function(){
            return {
                user_name: '',
                user_password: '',
                user_email: '',
                user_score: {
                  professional:"50",
                  social: "25",
                  personal: "25"
                }
            };
        },

        idAttribute: "id",
            
        validate: function(attrs){
            // if (attrs.user_name === ''){
            //     return {error_desc:"ERROR: Name must not be empty!"};
            // }
            
            // if (attrs.user_password.length < 5){
            //     return {error_desc:"ERROR: Password must be at least 6 characters long!"};
            // }
        },
            
        initialize: function(){
        },
            
        clear: function() {
            this.destroy();
        },
            
        urlRoot: serverPath + "/user_create"
    });

    App.UserAccountCreator = Backbone.View.extend({
          el: "#start-step5-user-creation",
          
          initialize: function(){
            var that = this;
            var $form = this.$el.find('form');
            this.validator = $form.validate();

          }, // <-- end initialize: function(){..}
          
          
          render:{
              
          },
          
          events:{
              "click #submitAccount": "submitUserAccout"
          },

          submitUserAccout: function(ev){
              ev.preventDefault();
              var userModel = new App.UserModel();
              var $form = this.$el.find('form');
              var obj = $form.serializeObject();
              console.log(obj);
              window.leForm = $form;
              if ($form.valid()){

                  obj.user_score = {};
                  obj.user_score.professional = App.userGoalsAnalyzer.values_arr[0][1];
                  obj.user_score.personal = App.userGoalsAnalyzer.values_arr[1][1];
                  obj.user_score.social = App.userGoalsAnalyzer.values_arr[2][1];

                  console.log(obj);
                  
                  userModel.set(obj);
                  
                  var that = this;
                  
                  userModel.save(null,{
                      wait: true,
                      success: function(model, response){
                          console.log("## Save successfull!");
                          //$.modal.alert("Update new Page Details to Server Successful!");
                          console.log(response);


                          var user_id = response.user_id;
                          if (!user_id){
                            var error_str = response.error.text;
                            console.log(">> ERROR"+error_str);
                            Utils.showWarning(error_str,that.$el);
                            //$(".error_email").html(error_str).css({display: "block"});
                            //that.validator.showErrors({"inputEmail": "I know that your firstname is Pete, Pete!"});  
                          } else {
                            App.broadcastManager.trigger("saveGoalsForUser",user_id);
                          }
                          //console.log(ev);
                      },
                      error : function(model, response){
                          console.log("## ERROR on update");
                          console.log(response);
                      }
                  });
              }
  
          }
      });
    
    
    
    /* initialize userGoals */
    App.userGoals = new App.GoalsList();
    App.goalAnalyzer = new App.GoalAnalyzer();
    App.userGoalsAnalyzer = new App.UserScoresAnalyzer();
    App.userAccount = new App.UserAccountCreator();

    
});





