var FruitNinja = FruitNinja || {};

FruitNinja.LevelState = function () 
{
    "use strict";
    Phaser.State.call(this);
    
    this.prefab_classes = //check to see if the type is present in the prefab_classes object, if so instanstiate prefab
    {
        "fruit_spawner": FruitNinja.FruitSpawner.prototype.constructor,
        "bomb_spawner": FruitNinja.BombSpawner.prototype.constructor,
        "background": FruitNinja.Prefab.prototype.constructor
    };
};

FruitNinja.LevelState.prototype = Object.create(Phaser.State.prototype);

FruitNinja.LevelState.prototype.constructor = FruitNinja.LevelState;
var music, gameOver;
FruitNinja.LevelState.prototype.init = function (level_data)
{
    "use strict";
    this.level_data = level_data;
    
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //set the scale of the game to the entire screen
    
    this.scale.pageAlignHorizontally = true;
    
    this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 1000; // this will make sure that the objects fall quickly
    
    this.MINIMUM_SWIPE_LENGTH = 50; // the minimum distance for a swipe on screen to be considered a 'cut'
     music = this.game.add.audio("audio")
    this.score = 0; //initialise score to 0 at the start of the game
    music.play();
    music.loop = true
};

FruitNinja.LevelState.prototype.create = function ()
{
    "use strict";
    var group_name, prefab_name;
    
    // create empty group object
    this.groups = {};
    
    this.level_data.groups.forEach(function (group_name) 
    {
        this.groups[group_name] = this.game.add.group(); //add each group to the group object
        
    }, this);
    
    // create prefab object
    this.prefabs = {};
    for (prefab_name in this.level_data.prefabs)
    {
        if (this.level_data.prefabs.hasOwnProperty(prefab_name)) //if there is a prefab name
        {
            // create prefab
            this.create_prefab(prefab_name, this.level_data.prefabs[prefab_name]); //create prefab with that name
        }
    }
    
    //start the swipe input
    this.game.input.onDown.add(this.start_swipe, this);
    
    this.game.input.onUp.add(this.end_swipe, this); //end swipe input
    
    this.init_hud(); //initialise the hud of the game 
};

FruitNinja.LevelState.prototype.create_prefab = function (prefab_name, prefab_data)
{
    "use strict";
    var prefab;
    // create object according to its type
    if (this.prefab_classes.hasOwnProperty(prefab_data.type))
    {
        prefab = new this.prefab_classes[prefab_data.type](this, prefab_name, prefab_data.position, prefab_data.properties);
    }
};

FruitNinja.LevelState.prototype.start_swipe = function (pointer) 
{
    "use strict";
    this.start_swipe_point = new Phaser.Point(pointer.x, pointer.y);
};

FruitNinja.LevelState.prototype.end_swipe = function (pointer)
{
    "use strict";
    var swipe_length, cut_style, cut;
  //  this.Game_Audio = this.game_state.add('Game_Audio')
    this.end_swipe_point = new Phaser.Point(pointer.x, pointer.y);
    
    swipe_length = Phaser.Point.distance(this.end_swipe_point, this.start_swipe_point); //calculate the distace between the start point and end point between the start_swipe and end_swipe
    
    // if the swipe length is greater than the minimum, a swipe is detected
    if (swipe_length >= this.MINIMUM_SWIPE_LENGTH)
    {
        // create a new line as the swipe and check for collisions
        cut_style = {line_width: 5, color: 0xE82C0C, alpha: 1} //create red line to show cut on screen
        
        cut = new FruitNinja.Cut(this, "cut", {x: 0, y: 0}, {group: "cuts", start: this.start_swipe_point, end: this.end_swipe_point, duration: 0.3, style: cut_style});
        
        this.swipe = new Phaser.Line(this.start_swipe_point.x, this.start_swipe_point.y, this.end_swipe_point.x, this.end_swipe_point.y);
        
        this.groups.fruits.forEachAlive(this.check_collision, this); //check all fruits in existence for a collison
        
        this.groups.bombs.forEachAlive(this.check_collision, this); //check all bombs in existence for a collision
    }
};

FruitNinja.LevelState.prototype.check_collision = function (object)
{
    "use strict";
    var object_rectangle, line1, line2, line3, line4, intersection;
    
    // create a rectangle for the object body of the fruits and the bombs
    object_rectangle = new Phaser.Rectangle(object.body.x, object.body.y, object.body.width, object.body.height);
    
    // check for intersections with each rectangle edge
    line1 = new Phaser.Line(object_rectangle.left, object_rectangle.bottom, object_rectangle.left, object_rectangle.top);
    
    line2 = new Phaser.Line(object_rectangle.left, object_rectangle.top, object_rectangle.right, object_rectangle.top);
    
    line3 = new Phaser.Line(object_rectangle.right, object_rectangle.top, object_rectangle.right, object_rectangle.bottom);
    
    line4 = new Phaser.Line(object_rectangle.right, object_rectangle.bottom, object_rectangle.left, object_rectangle.bottom);
    
    intersection = this.swipe.intersects(line1) || this.swipe.intersects(line2) || this.swipe.intersects(line3) || 
    
    this.swipe.intersects(line4);
    if (intersection) {
        // if an intersection is found, cut the object
        object.cut();
    }
};

FruitNinja.LevelState.prototype.init_hud = function ()
{
    "use strict";
    var score_position, score_style, score;
    // create score prefab
    score_position = new Phaser.Point(20, 20); //set the score value to the top left hand corner with a spacing of 20 for x,y
    score_style = {font: "48px Arial", fill: "#fff"}; //set the style for the score
    score = new FruitNinja.Score(this, "score", score_position, {text: "Fruits: ", style: score_style, group: "hud"});
};

FruitNinja.LevelState.prototype.game_over = function ()
{
    "use strict";
    var game_over_panel, game_over_position, game_over_bitmap, panel_text_style;
    // if current score is higher than highest score, update it
    if (!localStorage.highest_score || this.score > localStorage.highest_score)
    {
        localStorage.highest_score = this.score;
    }
     gameOver = this.game.add.audio("GameOver")
    gameOver.play()
    music.fadeOut(500);
    game_over_position = new Phaser.Point(0, this.game.world.height); 
    game_over_bitmap = this.add.bitmapData(this.game.world.width, this.game.world.height); //set the width and height of bitmap to the width and height of screen
    game_over_bitmap.ctx.fillStyle = "#000"; //set color for bitmap
    game_over_bitmap.ctx.fillRect(0, 0, this.game.world.width, this.game.world.height);
    panel_text_style = {game_over: {font: "32px Arial", fill: "#FFF"},
                       current_score: {font: "20px Arial", fill: "#FFF"},
                       highest_score: {font: "18px Arial", fill: "#FFF"}};
    // create the game over panel
    game_over_panel = new FruitNinja.GameOverPanel(this, "game_over_panel", game_over_position, {texture: game_over_bitmap, group: "hud", text_style: panel_text_style, animation_time: 500});
    this.groups.hud.add(game_over_panel);
};

FruitNinja.LevelState.prototype.restart_level = function ()
{
    "use strict";
    this.game.state.restart(true, false, this.level_data); //restart the game
};
