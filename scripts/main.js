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
    
    var collision = 0,
        intersectionCheck = function (subject1, subject2) {return ((subject1.collider.x < subject2.collider.x + subject2.collider.width) && (subject1.collider.x + subject1.collider.width > subject2.collider.x) && (subject1.collider.y < subject2.collider.y + subject2.collider.height) && (subject1.collider.y + subject1.collider.height > subject2.collider.y)); };
    
    
    //Combat handling
    if (intersectionCheck(subject1, subject2) && subject1.combat !== undefined && subject2.combat !== undefined && ((subject1.enemy && !subject2.enemy) || (!subject1.enemy && subject2.enemy))) {
        if (subject1.state !== 'fighting') {
            subject1.state = 'fighting';
            subject2.HP -= subject1.combat.damage;
            setTimeout(function () {subject1.state = 'thinking'; }, subject1.combat.delay);
        }

        if (subject2.state !== 'fighting') {
            subject2.state = 'fighting';
            
            subject1.HP -= subject2.combat.damage;
            setTimeout(function () {subject2.state = 'thinking'; }, subject2.combat.delay);
        }
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
    
    panorama.entities = [];
    
    panorama.command = "none";
    panorama.mousePos = {x: 0, y: 0};
    
    //Menu setup
    panorama.gameScene = "menu";
    panorama.oracle.shaper.font = "74px Impact";
    panorama.oracle.shaper.fillStyle = "white";
    panorama.oracle.shaper.fillText("Hack The North! 015", 100, 100);
    
    //Player setup
    panorama.player = {};
    panorama.player.villagers = 0;
    panorama.player.food = 0;
    panorama.player.iceblocks = 0;
    
    panorama.enemies = 2;
    
    /* -------- TEST GROUND -------- */
    var i = 0, j = 0,
        colliders = [],
        quadTree = new panorama.QuadTree({x: 0, y: 0, width: panorama.oracle.width, height: panorama.oracle.height});
    
    
    for (i = 0; i < 4; i += 1) {
        panorama.entities.push(panorama.inhabitantMaker({coordinates: {x: 400, y: 225}, colors: panorama.getColors()}));
        panorama.player.villagers += 1;
    }
    
    
    panorama.entities.push(panorama.propMaker({coordinates: {x: 200, y: 200}, colors: panorama.getColors()}));
    panorama.entities.push(panorama.propMaker({coordinates: {x: 211, y: 200}, colors: panorama.getColors()}));
    panorama.entities.push(panorama.propMaker({coordinates: {x: 200, y: 195}, colors: panorama.getColors()}));
    
    
    panorama.entities.push(panorama.monsterMaker({coordinates: {x: 400, y: 0}, colors: panorama.getColors()}));
    panorama.entities.push(panorama.monsterMaker({coordinates: {x: 400, y: 450}, colors: panorama.getColors()}));
    
    panorama.body = document.body;
    panorama.body.onmousemove = function (event) {
        var rect = panorama.oracle.getBoundingClientRect();
        
        panorama.mousePos.x = event.clientX - rect.left;
        panorama.mousePos.y = event.clientY - rect.top;
    };
    
    panorama.buttons.b1.onmouseup = function () {
        panorama.entities.push(panorama.inhabitantMaker({coordinates: {x: 400, y: 400}, colors: panorama.getColors()}));
        switch (panorama.gameScene) {
        case "village":
        case "menu":
        case "exploring":
            break;
        }
    };
    
    panorama.buttons.b2.onmouseup = function () {
        switch (panorama.gameScene) {
        case "village":
            panorama.command = "move";
            break;
        case "menu":
        case "exploring":
            break;
        }
    };
    
    panorama.buttons.b5.onmouseup = function () {
        switch (panorama.gameScene) {
        case "village":
            panorama.gameScene = "exploring";
            exploreLoop();
            break;
        case "menu":
        case "exploring":
            break;
        }
    };
    
    /* ------ END TEST GROUND ------ */
    
    
    // Handle the subjects update and draw 
	function mainLoop() {
        
        if (panorama.gameScene === "village") {
            // Draw the background
            panorama.oracle.shaper.fillStyle = "white";
            panorama.oracle.shaper.fillRect(0, 0, 800, 600);
                                 
            // Draw lakes
            panorama.oracle.shaper.fillStyle = "lightblue";
            panorama.oracle.shaper.beginPath();
            panorama.oracle.shaper.arc(0, 0, 100, 2 * Math.PI, false);
            panorama.oracle.shaper.closePath();
            panorama.oracle.shaper.fill();
            
            panorama.oracle.shaper.fillStyle = "lightblue";
            panorama.oracle.shaper.beginPath();
            panorama.oracle.shaper.arc(800, 450, 100, 2 * Math.PI, false);
            panorama.oracle.shaper.closePath();
            panorama.oracle.shaper.fill();
            
        }
        
        // Update subjects 
        for (i = 0; i < panorama.entities.length; i += 1) {
            panorama.entities[i].update();
        }
        
        // Reset the quadTree
        quadTree.clear();
        for (i = 0; i < panorama.entities.length; i += 1) {
            quadTree.insert(panorama.entities[i]);
        }
        
        // Check collision
        panorama.entities = [];
        panorama.entities = quadTree.getAllObjects(panorama.entities);
        for (i = 0; i < panorama.entities.length; i += 1) {
            colliders = [];
            quadTree.findObjects(colliders, panorama.entities[i]);
            for (j = 0; j < colliders.length; j += 1) {
                panorama.checkCollision(panorama.entities[i], colliders[j]);
            }
            
            if ((panorama.entities[i].collider.x * panorama.entities[i].collider.x + panorama.entities[i].collider.y * panorama.entities[i].collider.y < 10000) || ((panorama.entities[i].collider.x - 800) * (panorama.entities[i].collider.x - 800) + (panorama.entities[i].collider.y - 450) * (panorama.entities[i].collider.y - 450) < 10000)) {
                panorama.player.food += 1;
            }
        }
        
        if (panorama.gameScene === "village") {
            // Draw
            quadTree.draw();
            panorama.entities.sort(function (subject1, subject2) { return subject1.collider.y - subject2.collider.y; });
            for (i = 0; i < panorama.entities.length; i += 1) {
                if (panorama.entities[i].HP <= 0) {
                    panorama.entities[i].enemy === true ? panorama.enemies -= 1 : panorama.player.villagers -= 1;
                    panorama.entities.splice(i, 1);
                    
                } else {
                    panorama.entities[i].draw();
                }
            }

            // Draw mouse Pos
            if (panorama.command === "move") {
                panorama.oracle.shaper.strokeStyle = "red";
                panorama.oracle.shaper.lineWidth = 4;
                panorama.oracle.shaper.beginPath();
                panorama.oracle.shaper.arc(panorama.mousePos.x, panorama.mousePos.y, 15, 2 * Math.PI, false);
                panorama.oracle.shaper.closePath();
                panorama.oracle.shaper.stroke();
                panorama.oracle.shaper.beginPath();
                panorama.oracle.shaper.arc(panorama.mousePos.x, panorama.mousePos.y, 10, 2 * Math.PI, false);
                panorama.oracle.shaper.closePath();
                panorama.oracle.shaper.stroke();
            }
            
        }
        panorama.oracleInterface.shaper.clearRect(0, 0, 800, 100);
        panorama.oracleInterface.shaper.fillStyle = "white";
        panorama.oracleInterface.shaper.font = "35px Impact";
        panorama.oracleInterface.shaper.fillText(panorama.enemies + " Enemies left!", 300, 40);
        
        panorama.oracleInterface.shaper.fillStyle = "white";
        panorama.oracleInterface.shaper.font = "18px Impact";
        panorama.oracleInterface.shaper.fillText("Villagers count: " + panorama.player.villagers, 10, 80);
        panorama.oracleInterface.shaper.fillText("Food count: " + panorama.player.food, 350, 80);
        panorama.oracleInterface.shaper.fillText("Iceblocks count: " + panorama.player.iceblocks, 650, 80);
	}
    
    function exploreLoop() {
        
        panorama.oracle.shaper.font = "50px Impact";
        panorama.oracle.shaper.fillStyle = "white";
        
        panorama.oracle.shaper.clearRect(0, 0, 800, 800);
        
        setTimeout(function () { panorama.oracle.shaper.fillText("Villagers sent out to scavenge", 100, 100); }, 1000);
        setTimeout(function () { panorama.oracle.shaper.fillText(".", 300, 200); }, 2000);
        setTimeout(function () { panorama.oracle.shaper.fillText(".", 400, 200); }, 2500);
        setTimeout(function () { panorama.oracle.shaper.fillText(".", 500, 200); }, 3000);
        
        //Throw the event outcome
        
        
        setTimeout(function () { panorama.gameScene = "village"; }, 5000);
    }
    
    function newInhabitants() {
        var i;
        
        if (panorama.player.villagers >= 500) {
            return;
        }
        
        panorama.player.food -= panorama.player.villagers * 600;
        
        for (i = 0; i < panorama.player.villagers / 2; i += 1) {
            panorama.entities.push(panorama.inhabitantMaker({coordinates: {x: 400, y: 225}, colors: panorama.getColors()}));
        }
        panorama.player.villagers += i;
        
    }
    
    function newMonstersTop() {
        var i;
        
        if (panorama.enemies >= 500) {
            return;
        }
        
        for (i = 0; i < panorama.enemies / 2; i += 1) {
            panorama.entities.push(panorama.monsterMaker({coordinates: {x: 400, y: 0}, colors: panorama.getColors()}));
        }
        panorama.enemies += i;
    }
    
    function newMonstersBot() {
        var i;
        
        if (panorama.enemies >= 500) {
            return;
        }
        
        for (i = 0; i < panorama.enemies / 2; i += 1) {
            panorama.entities.push(panorama.monsterMaker({coordinates: {x: 400, y: 450}, colors: panorama.getColors()}));
        }
        panorama.enemies += i;
    }
    
    //Start the game
    panorama.oracle.onclick = function (event) {
        if (panorama.gameScene === "menu") {
            
            // Assign and call the main game loop (30,30... fps)
            panorama.gameScene = "village";
            panorama.loopControl = setInterval(mainLoop, 33);
            panorama.inhabitantsControl = setInterval(newInhabitants, 30000);
            panorama.monstersControlTop = setInterval(newMonstersTop, 45000);
            panorama.monstersControlBot = setInterval(newMonstersBot, 45000);
        }
        
        if (panorama.gameScene === "village" && panorama.command === "move") {
            panorama.command = "none";
            
            for (i = 0; i < panorama.entities.length; i += 1) {
                if (panorama.entities[i].order !== undefined && panorama.entities[i].enemy === false) {
                    var rect = panorama.oracle.getBoundingClientRect();
                    panorama.entities[i].order("moving", {x: event.clientX - rect.left, y: event.clientY - rect.top});
                }
            }
        }
    };
    
    
};