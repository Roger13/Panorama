panorama.QuadTree = function (boundBox, lvl) {
	'use strict';
    var maxObjects = 10,
        objects = [],
	    level = lvl || 0,
        maxLevels = 5;
    
    this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
    this.nodes = [];
    // Draw the nodes for debugging
    this.draw = function () {
        var i;
        for (i = 0; i < this.nodes.length; i += 1) {
            this.nodes[i].draw();
        }

        panorama.oracle.shaper.strokeStyle = 'red';
        panorama.oracle.shaper.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        
    };
    // Clears the quadTree and all nodes of objects
	this.clear = function () {
		objects = [];
        
        var i;
		for (i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].clear();
		}

		this.nodes = [];
	};
	// Get all objects in the quadTree
	this.getAllObjects = function (returnedObjects) {
		var i, len;
        for (i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].getAllObjects(returnedObjects);
		}
		for (i = 0, len = objects.length; i < len; i += 1) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};

	// Determine which node the object belongs to 
    // -1 means object cannot completely fit within a node and is part of the current node
	this.getIndex = function (obj) {

		var index = -1,
            verticalMidpoint = this.bounds.x + this.bounds.width / 2,
            horizontalMidpoint = this.bounds.y + this.bounds.height / 2,
            // Object can fit completely within the top quadrant
            topQuadrant = (obj.collider.y < horizontalMidpoint && obj.collider.y + obj.collider.height < horizontalMidpoint),
            // Object can fit completely within the bottom quandrant
		    bottomQuadrant = (obj.collider.y > horizontalMidpoint);

		// Object can fit completely within the left quadrants
		if (obj.collider.x < verticalMidpoint &&
				obj.collider.x + obj.collider.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			} else if (bottomQuadrant) {
				index = 2;
			}
		} else if (obj.collider.x > verticalMidpoint) { // Object can fix completely within the right quandrants
			if (topQuadrant) {
				index = 0;
			} else if (bottomQuadrant) {
				index = 3;
			}
		}
		return index;
	};

	// Return all objects that the object could collide with (except itself) that are inside the same node or above
	this.findObjects = function (returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}
        var i, len,
            index = this.getIndex(obj);
        // Case the obj is inside a subnode
        if (index !== -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}
        
		for (i = 0, len = objects.length; i < len; i += 1) {
			if (obj !== objects[i]) {
                returnedObjects.push(objects[i]);
            }
		}

		return returnedObjects;
	};

	// Insert the object into the quadTree. 
    // if the tree excedes the capacity, it will split and add all objects to their corresponding nodes
	this.insert = function (obj) {
		if (typeof obj === "undefined") {
			return;
		}
        var i, len, index;
        // Case multiple objects are passed as an array
		if (obj instanceof Array) {
			for (i = 0, len = obj.length; i < len; i += 1) {
				this.insert(obj[i]);
			}
			return;
		} // Check if it fit within a subnode
		if (this.nodes.length) {
            index = this.getIndex(obj);
			// Only add the object to a subnode if it can fit completely within one
			if (index !== -1) {
				this.nodes[index].insert(obj);
                return;
			}
		}
        // Else push and split if necessary
		objects.push(obj);

		// Prevent infinite splitting
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}
            i = 0;
            // Distribute the objects within the subnodes when possible
			while (i < objects.length) {
				index = this.getIndex(objects[i]);
				if (index !== -1) {
					this.nodes[index].insert((objects.splice(i, 1))[0]);
				} else {
					i += 1;
				}
			}
		}
	};
	
    // Splits the node into 4 subnodes
	this.split = function () {
		// Bitwise or [html5rocks]
		var subWidth = (this.bounds.width / 2) | 0,
            subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new panorama.QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level + 1);
		this.nodes[1] = new panorama.QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level + 1);
		this.nodes[2] = new panorama.QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level + 1);
		this.nodes[3] = new panorama.QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level + 1);
	};
};
