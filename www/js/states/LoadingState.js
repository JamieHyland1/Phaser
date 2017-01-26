var FruitNinja = FruitNinja || {}; //set fruitninja variable to itself if initialised if not, set it to empty object

FruitNinja.LoadingState = function ()
{
    "use strict";
    Phaser.State.call(this);
};

FruitNinja.prototype = Object.create(Phaser.State.prototype);

FruitNinja.prototype.constructor = FruitNinja.LoadingState;

FruitNinja.LoadingState.prototype.init = function (level_data) 
{
    
    "use strict";
    
    this.level_data = level_data;
};

FruitNinja.LoadingState.prototype.preload = function ()
{
    "use strict";
    var assets, asset_loader, asset_key, asset; // initialise variables
    assets = this.level_data.assets; 
    for (asset_key in assets) //for every asset_key in assets
    {                                               
        if (assets.hasOwnProperty(asset_key)) // if the asset has its own assetKey
        {
         asset = assets[asset_key];
            switch (asset.type) // check to see what type of asset has been loaded
            {
                case "image":
                this.load.image(asset_key, asset.source); //if the asset was an image load the image
                break;
                case "spritesheet": // if it was a spritesheet load it as a spritesheet
                this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
                break;
                case "audio":
                this.load.audio(asset_key, asset.source);
                  
            }
        }
    }
};

FruitNinja.LoadingState.prototype.create = function ()
{
    "use strict";
    this.game.state.start("GameState", true, false, this.level_data); //start levelstate
   // this.game.play("Game_Audio")
};