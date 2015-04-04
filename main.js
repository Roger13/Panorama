// Global object
var panorama = {};

// Return a vector with the color and its dark correspondent
panorama.getColors = function () {
	"use strict";	// Allow exceptions related to good practices to be thrown
	
	var red = Math.ceil(194 * Math.random()) + 64, green = Math.ceil(194 * Math.random()) + 64, blue = Math.ceil(194 * Math.random()) + 64,
	    color = 'rgb(' + red + ',' + green + ',' + blue + ')',
        darkColor = 'rgb(' + Math.ceil(red / 1.5) + ',' + Math.ceil(green / 1.5) + ',' + Math.ceil(blue / 1.5) + ')';

	return {color: color, darkColor: darkColor};
};

// Checks and handle collision between subjects passed as arguments
panorama.checkCollision = function (subject1, subject2) {
    "use strict";
    
    var collision = 0;
    // Collision checking
    if ((subject1.collider.x < subject2.collider.x + subject2.collider.width) && (subject1.collider.x + subject1.collider.width > subject2.collider.x) && (subject1.collider.y < subject2.collider.y + subject2.collider.height) && (subject1.collider.y + subject1.collider.height > subject2.collider.y)) {
        // Naive fix, must change due to not all subjects having displacement attribute
        subject1.collider.x -= subject1.displacement.x;
        subject2.collider.x -= subject2.displacement.x;
        subject1.collider.y -= subject1.displacement.y;
        subject2.collider.y -= subject2.displacement.y;
        
        // TO-DO Warn the subjects with whom they collided
    }
};

// Get the references to the oracle, its buttons and interface and start the game loop
panorama.oracleInit = function () {
	"use strict";

    // Getting reference to canvas "oracle" and "oracleInterface" (botton one)
	panorama.oracle = document.getElementById('oracle');
    panorama.oracle.shaper = panorama.oracle.getContext('2d');
    panorama.oracleInterface = document.getElementById('oracleInterface');
    panorama.oracleInterface.shaper = panorama.oracleInterface.getContext('2d');
    
    // Getting references to UI buttons
    panorama.buttons = {};
    panorama.buttons.b1 = document.getElementById('b1');
    panorama.buttons.b2 = document.getElementById('b2');
    panorama.buttons.b3 = document.getElementById('b3');
	panorama.buttons.b4 = document.getElementById('b4');
    panorama.buttons.b5 = document.getElementById('b5');
    
    /* -------- TEST GROUND -------- */
    var i = 0, j = 0,
        entities = [],
        colliders = [],
        quadTree = new panorama.QuadTree({x: 0, y: 0, width: panorama.oracle.width, height: panorama.oracle.height});
    
    for (i = 0; i < 20; i += 1) {
        entities[i] = panorama.inhabitantMaker({coordinates: {x: 50 + 20 * i, y: 50 + 10 * i}, colors: panorama.getColors()});
    }
    
    panorama.buttons.b1.onmouseup = function () {
        entities.push(panorama.inhabitantMaker({coordinates: {x: 400, y: 400}, colors: panorama.getColors()}));
    };
    
    /* ------ END TEST GROUND ------ */
    
    // Handle the subjects update and draw 
	function mainLoop() {
        
        // Clear the canvas
        panorama.oracle.shaper.clearRect(0, 0, 800, 600);	// Clear the oracle
        
        // Update subjects 
        for (i = 0; i < entities.length; i += 1) {
            entities[i].update();
        }
        
        // Reset the quadTree
        quadTree.clear();
        for (i = 0; i < entities.length; i += 1) {
            quadTree.insert(entities[i]);
        }
        
        // Check collision
        entities = [];
        entities = quadTree.getAllObjects(entities);
        for (i = 0; i < entities.length; i += 1) {
            colliders = [];
            quadTree.findObjects(colliders, entities[i]);
            for (j = 0; j < colliders.length; j += 1) {
                panorama.checkCollision(entities[i], colliders[j]);
            }
        }
        
        // Draw
        quadTree.draw();
        entities.sort(function (subject1, subject2) { return subject1.collider.y - subject2.collider.y; });
        for (i = 0; i < entities.length; i += 1) {
            entities[i].draw();
        }
        
	}
    
    // Assign and call the main game loop (30,30... fps)
	panorama.loopControl = setInterval(mainLoop, 33);
};