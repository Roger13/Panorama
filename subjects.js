// spec {collider: {x: --, y: --, width: --, height: --}. colors: {color: --, darkColor: --}}
panorama.Subject = function (spec) {
    'use strict';
    this.colors = spec.colors;
    this.collider = spec.collider;
    this.state = 'still';
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
panorama.inhabitantMaker = function (spec, my) {
    'use strict';
    spec.collider = {x: spec.coordinates.x, y: spec.coordinates.y, width: 8, height: 4};
    var inhabitant = new panorama.Subject(spec),
        // Private instance variables;
        actions = ['idle', 'thinking', 'moving'],
        mass = 10,
        maxDisplacement = 2;
        
    
    // Public interface
    inhabitant.collider = {x: spec.coordinates.x, y: spec.coordinates.y, width: 8, height: 4};
    inhabitant.destination = {x: spec.coordinates.x, y: spec.coordinates.y};
    inhabitant.displacement = {x: 0, y: 0};
    inhabitant.state = 'idle';
    inhabitant.update = function () {
        switch (this.state) {
        case 'thinking':
            break;
        case 'idle':
            this.think();
            break;
        case 'moving':
            this.move();
            break;
        }
    };
    inhabitant.think = function () {
        // Fetch a random state from actions list
        this.state = actions[Math.floor(Math.random() * actions.length)];
       
        // Prepair for the action
        switch (this.state) {
        case 'thinking':
            // 'that' fixes setTimeOut setting the context to the global object     
            var that = this;
            setTimeout(function () {that.state = 'idle'; }, 2000);
            break;
        case 'moving':
            this.destination = {x: this.collider.x + Math.round(40 * Math.random() - 20), y: this.collider.y + Math.round(40 * Math.random() - 20)};
            break;
        }
    };
    inhabitant.move = function () { // Calculate the this.displacement components according to cosine 
        this.state = 'moving';
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
            this.state = 'idle';
        }
        // Apply the this.displacement
        this.collider.x += this.displacement.x;
        this.collider.y += this.displacement.y;
    };
    inhabitant.draw = function () {
        // Body and face
        panorama.oracle.shaper.fillStyle = this.colors.color;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 13, 8, 4);
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 8, 8, 8);
        // Top of head
        panorama.oracle.shaper.fillStyle = this.colors.darkColor;
        panorama.oracle.shaper.fillRect(this.collider.x, this.collider.y + this.collider.height - 17, 8, 4);
    };
    return inhabitant;
};