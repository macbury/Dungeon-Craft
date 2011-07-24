// Import the cocos2d module
var cocos = require('cocos2d'),
  dungeon = require('lib/layout'),
// Import the geometry module
  geo = require('geometry');

require("lib/utils");

// Create a new layer
var DungeonCraft = cocos.nodes.Layer.extend({
  init: function() {
    // You must always call the super class version of init
    DungeonCraft.superclass.init.call(this);

    // Get size of canvas
    var s = cocos.Director.get('sharedDirector').get('winSize');

    // Create label
    var label = cocos.nodes.Label.create({string: 'Dungeon Craft', fontName: 'Tahoma', fontSize: 36});

    // Add label to layer
    this.addChild({child: label, z:1});

    // Position the label in the centre of the view
    label.set('position', geo.ccp(s.width / 2, s.height / 2));
  }
});

exports.main = function() {
  // Initialise application

  // Get director
  var director = cocos.Director.get('sharedDirector');
  // Attach director to our <div> element
  director.displayFPS = true;
  director.maxFrameRate = 60;
  /*director.attachInView(document.getElementById('dungeon_craft_app'));

  // Create a scene
  var scene = cocos.nodes.Scene.create();

  // Add our layer to the scene
  scene.addChild({child: DungeonCraft.create()});

  // Run the scene
  director.runWithScene(scene);*/
  
  
};
