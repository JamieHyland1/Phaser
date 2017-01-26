var FruitNinja = FruitNinja || {}; // Set fruitNinja to itself if already initialised if not, set to empty js Object

FruitNinja.BootState = function ()
{
    "use strict"; // this will cause javascript to run in strict mode, and will throw more errors due to bad syntax and helps prevent accidentally creating new global variables due to misnamed variables etc..
    Phaser.State.call(this);
};

FruitNinja.prototype = Object.create(Phaser.State.prototype);

FruitNinja.prototype.constructor = FruitNinja.BootState;

FruitNinja.BootState.prototype.init = function (level_file)
{
    "use strict";
    
    this.level_file = level_file; //initialise levelfile
};

FruitNinja.BootState.prototype.preload = function ()
{
    "use strict";
    
    this.load.text("level1", this.level_file); // load the JSON file
};

FruitNinja.BootState.prototype.create = function ()
{
    "use strict";
    var level_text, level_data;
    level_text = this.game.cache.getText("level1"); // set the text
    level_data = JSON.parse(level_text);
    this.game.state.start("LoadingState", true, false, level_data); //start loading state
};