<?php 

require_once 'Slim/Slim.php';
require_once 'rb.php';

R::setup('mysql:host=localhost;
        dbname=zengoals','root','');

$app = new Slim();

// $app->get('/pages', 'getPages');
// $app->get('/pages/:id','getPage');
// $app->post('/pages', 'savePage');
// $app->put('/pages/:id', 'savePage');
// $app->delete('/pages/:id', 'deletePage');


$app->post("/user_create",'createUser');
$app->post("/goals/:userID","createGoal");

$app->get("/user_test_logged_in",'testLogin');
$app->get('/user_login','doLogin');
$app->get("/user/:id", 'getUser');

/** Goals stuff */
$app->get("/user/:id/goals", 'getUserGoals');
$app->put("/user/:id/goals/:goalID", 'saveUserGoal');

$app->run();


function testLogin(){
    if (isset($_SESSION['USER_LOGGED_IN']) && $_SESSION['USER_LOGGED_IN'] == 13){
        $logedIn = true;    
    }

    if (isset($logedIn) && $logedIn){
        echo '{ "logged_str": "true", "id": "'.$_SESSION['USER_ID'].'" }';
    } else {
        echo '{ "logged_str": "false"}';
    }
}

/**
 * [getUsersByEmail description]
 * @return [type] $user Bean
 */
function getUsersByEmail($user_email){

    $sql_query = 'email = ?';
    
    $users_arr = array();
    $data_arr = array();
    $data_arr[] = strtolower($user_email);

    $users_arr = R::find('user', $sql_query, $data_arr);
    
    return $users_arr;
}



function doLogin(){
    $req = Slim::getInstance()->request();
    //$userData_obj = json_decode($request->getBody(),false);
    $user_email = $req->get('userEmail');
    $user_pass = $req->get('userPass');


    $users_arr = getUsersByEmail($user_email);

    foreach ($users_arr as $user) {
        if ($user->password == $user_pass){
            $active_user = $user;
             break;
        }
    }


    // @$user = $users_arr[0];

    if (isset($active_user)) {
        $_SESSION['USER_LOGGED_IN'] = 13;
        $_SESSION['USER_ID'] = $active_user->id;
        echo '{ "success": "true" }';
    }
    else {
        echo '{ "success": "false" }';
    }
        
}


function createUser(){
    $request = Slim::getInstance()->request();
    $userData_obj = json_decode($request->getBody(),false);


    $users_arr = getUsersByEmail(strtolower($userData_obj->user_email));

    if (isset($users_arr) && count($users_arr) >= 1){
            echo '{"error":{"text": "Opps user already in db!" }}';
            return;        
    }

    if (isset($userData_obj)){
        $user = R::dispense('user');
        $user->name = $userData_obj->user_name;
        $user->email = strtolower($userData_obj->user_email);
        $user->password = $userData_obj->user_password;
        $user->scoreprofessional = $userData_obj->user_score->professional;
        $user->scorepersonal = $userData_obj->user_score->personal;
        $user->scoresocial = $userData_obj->user_score->social;
        $user->status = 'newly_created';
        $user->availableslotsgoals = 1;

        $id = R::store($user);
        

        $_SESSION['USER_LOGGED_IN'] = 13;
        $_SESSION['USER_ID'] = $id;

        echo '{"user_id": "'.$id.'"}';
    }
    else {
        echo '{"error":{"text": "Opps can\'t add this page" }}'; 
    }
}

function createGoal($userID){
    $request = Slim::getInstance()->request();
    $goalData_obj = json_decode($request->getBody(),false);
    if (isset($goalData_obj)){
        $goal = R::dispense('goal');

        $goal->name = $goalData_obj->goal_name;
        $goal->scoreprofessional = $goalData_obj->goal_score->professional;
        $goal->scorepersonal = $goalData_obj->goal_score->personal;
        $goal->scoresocial = $goalData_obj->goal_score->social;
        $goal->userid = $userID;
        $goal->status = "newly_created";
        //$id = R::store($goal)
        //
        
        $user = R::load('user',$userID);
        $user->ownGoal[] = $goal;

        R::store($user);
        echo '{"success":"true"}';
    }
    else {
        echo '{"error":{"text": "Opps can\'t add this page" }}'; 
    }

}

function getUser( $id ){
    $user = R::load('user',$id);
    // echo 'haha';
    // var_dump($user);
    echo json_encode($user->export());
}


function getUserGoals( $id ){
    //echo ">get goals $id";
    $user = R::load('user',$id);
    if ($user->id){
        $goals = $user->ownGoal;
        //var_dump($goals);
        echo json_encode( R::exportAll( $goals ) );
    }
}

function saveUserGoal( $id, $goalID ){
    $goal = R::load('goal',$goalID);
    
    $request = Slim::getInstance()->request();
    $goalData_obj = json_decode($request->getBody(),false);
    
    if (isset($goalData_obj)){
        $goal->name = $goalData_obj->name;
        $goal->scoreprofessional = $goalData_obj->scoreprofessional;
        $goal->scorepersonal = $goalData_obj->scorepersonal;
        $goal->scoresocial = $goalData_obj->scoresocial;
        $goal->userid = $id;
        $goal->status = $goalData_obj->status;
        R::store($goal);
        echo json_encode(R::export());
    }


}


// function getPages(){
//     $controller_pages = new Controller_Pages();
//     $pages_arr = $controller_pages->get_all_pages();
    
//     echo '{"pages": '.json_encode($pages_arr).'}';
// }

// function getPage($id){
//     $controller_pages = new Controller_Pages();
//     $page_obj = $controller_pages->get_page($id);
//     if (isset($page_obj)){
//         echo '{"page": '. json_encode($page_obj). '}';
//     } else {
//         echo '{"error":{"text": "Opps can\'t find page ['.$id.']" }}'; 
//     }
// }


// function savePage(){
//     $controller_pages = new Controller_Pages();
//     $request = Slim::getInstance()->request();
//     $pageData_arr = json_decode($request->getBody(),true);
//     $page_obj = $controller_pages->save_page($pageData_arr);
//     if (isset($page_obj)){
//         echo json_encode($page_obj);
//     }
//     else {
//         echo '{"error":{"text": "Opps can\'t add this page" }}'; 
//     }
// }

// function deletePage($id){
//      $controller_pages = new Controller_Pages();
//      $res_bool = $controller_pages->delete_page($id);
//      if (!$res_bool){
//          echo '{"error":{"text":'.'"Oops Could NOT delete ["' .'$id]"}}'; 
//      }
// }


?>