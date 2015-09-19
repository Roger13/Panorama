// spec {collider: {x: --, y: --, width: --, height: --}. colors: {color: --, darkColor: --}}
panorama.Subject = function (spec) {
    'use strict';
    // +Public Attributes
    this.colors = spec.colors;
    this.collider = spec.collider; // Origin at top-left coordinate of the base
    this.displacement = {x: 0, y: 0};
    this.state = 'still';
    // +Public Methods
    this.update = function () {
        console.log("Lack of update method");
        console.log(this);
    };
    this.draw = function () {
        console.log("Lack of draw method");
        console.log(this);
    };
};

// spec: {coordinates: {x: --, y: --}, colors: {color: --, darkColor: --}}
panorama.inhabitantMaker = function (spec) {
    'use strict';
    spec.collider = {x: spec.coordinates.x, y: spec.coordinates.y, width: 8, height: 4};
    var inhabitant = new panorama.Subject(spec),
        // Private instance variables;
        actions = ['idle', 'thinking', 'moving'],
        thoughts = [], // Strings are actions, non-strings are parameters for previous action
        diplomacy = [],
        mass = 10,
        maxDisplacement = 2;
        
    // +Public Attributes
    inhabitant.destination = {x: spec.coordinates.x, y: spec.coordinates.y};
    inhabitant.state = 'thinking';
    // +Public Methods
    inhabitant.order = function (action, params) {
        if (typeof action !== "string") {
            console.log("Order is not a string");
        } else {
            thoughts.push(action);
            if (params !== undefined) {
                thoughts.push(params);
            }
        }
    };
    inhabitant.update = function () {
        switch (this.state) {
        case 'thinking':
            if (thoughts.length === 0) {
                this.think();
            } else {
                this.state = thoughts.shift();
            }
            break;
        case 'idle':
            break;
        case 'moving':
            // Check for parameters inside thoughts    
            if (thoughts.length > 0 && typeof thoughts[0] !== "string") {
                this.move(thoughts.shift());
            } else {
                this.move();
            }
            break;
        }
    };
    inhabitant.think = function () {
        // Fetch a random state from actions list
        this.state = actions[Math.floor(Math.random() * actions.length)];
       
        // Prepair for the action
        switch (this.state) {
        case 'idle':
            // 'that' fixes setTimeOut setting the context to the global object     
            var that = this;
            setTimeout(function () {if (that.state !== 'moving') {that.state = 'thinking'; } }, 2000);
            break;
        case 'moving':
            this.destination = {x: this.collider.x + Math.round(40 * Math.random() - 20), y: this.collider.y + Math.round(40 * Math.random() - 20)};
            break;
        }
    };
    inhabitant.move = function (destination) { // Calculate the this.displacement components according to cosine 
        this.state = 'moving';
        if (destination !== undefined) {
            inhabitant.destination = destination;
        }
        var distance = {x: inhabitant.destination.x - this.collider.x, y: inhabitant.destination.y - this.collider.y},
            angle = Math.atan(distance.y / distance.x); // Angle is between 90º and -90º

        // Stop the this.displacement if within maxDisplacement from the destination
        if (inhabitant.destination.x >= this.collider.x - maxDisplacement && inhabitant.destination.x <= this.collider.x + maxDisplacement) {
            this.displacement.x = 0;
            this.collider.x = Math.round((this.collider.x + inhabitant.destination.x) / 2);
        } else if (distance.x < 0) { // Case the angle is within second and third quadrant, the direction must be corrected
            this.displacement.x = -Math.round(maxDisplacement * Math.cos(angle));
        } else { // Case the angle is withing first and forth quadrant
            this.displacement.x = Math.round(maxDisplacement * Math.cos(angle));
        }
        // Stop the this.displacement if within maxDisplacement from the destination
        if (inhabitant.destination.y >= this.collider.y - maxDisplacement && inhabitant.destination.y <= this.collider.y + maxDisplacement) {
            this.displacement.y = 0;
            this.collider.y = Math.round((this.collider.y + inhabitant.destination.y) / 2);
        } else if (distance.x < 0) { // Case the angle is within second and third quadrant, the direction must be corrected
            this.displacement.y = -Math.round(maxDisplacement * Math.sin(angle));
        } else { // Case the angle is withing first and forth quadrant
            this.displacement.y = Math.round(maxDisplacement * Math.sin(angle));
        }
        // Change the state after finishing the movement
        if (this.displacement.x === 0 && this.displacement.y === 0) {
            this.destination = {x: this.collider.x, y: this.collider.y};
            if (thoughts.length > 0) {
                this.state = thoughts.shift();
            } else {
                this.state = 'thinking';
            }
        }
        // Apply the this.displacement
        this.collider.x += this.displacement.x;
        this.collider.y += this.displacement.y;
    };
    inhabitant.draw = function () {
        // Top of head and neck
        panorama.oracle.shaper.fillStyle = this.colors.darkColor;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 17, this.collider.width, 9); //Head + Neck
        // Body and face
        panorama.oracle.shaper.fillStyle = this.colors.color;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 13, this.collider.width, 4); //Face
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 8, this.collider.width, 8); //Body
    };
    return inhabitant;
};

// spec: {coordinates: {x: --, y: --}, colors: {color: --, darkColor: --}}
panorama.propMaker = function (spec) {
    'use strict';
    
    spec.collider = {x: spec.coordinates.x, y: spec.coordinates.y, width: 10, height: 10};
    var prop = new panorama.Subject(spec);
    
    prop.draw = function () {
        // Prop top
        panorama.oracle.shaper.fillStyle = this.colors.darkColor;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - this.collider.height / 2, this.collider.width, this.collider.height);
        // Prop body
        panorama.oracle.shaper.fillStyle = this.colors.color;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height, this.collider.width, this.collider.height / 2);
        
    };
    prop.update = function () {};
    return prop;
};