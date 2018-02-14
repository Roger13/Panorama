"use strict"

// Global object
var panorama = {}

// Return a vector with the color and its dark correspondent
panorama.getColors = function () {
	"use strict"	// Allow exceptions related to good practices to be thrown
	
	var red = Math.ceil(194 * Math.random()) + 64, green = Math.ceil(194 * Math.random()) + 64, blue = Math.ceil(194 * Math.random()) + 64,
	    color = 'rgb(' + red + ',' + green + ',' + blue + ')',
        darkColor = 'rgb(' + Math.ceil(red / 1.5) + ',' + Math.ceil(green / 1.5) + ',' + Math.ceil(blue / 1.5) + ')'

	return {color: color, darkColor: darkColor}
}


function beginPanorama() {
    var img = new Image();

img.src = "http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg";
    function instantiatePanorama() {
        panorama.buttons = {}
        panorama.buttons.b1 = document.getElementById('b1')
        panorama.buttons.b2 = document.getElementById('b2')
        panorama.buttons.b3 = document.getElementById('b3')
        panorama.buttons.b4 = document.getElementById('b4')
        panorama.buttons.b5 = document.getElementById('b5')
        
        panorama.entities = []

        panorama.oracle = document.getElementById('oracle')
        panorama.oracle.width = window.innerWidth
        panorama.oracle.height = window.innerHeight
        panorama.oracle.context = panorama.oracle.getContext('2d') 
        panorama.oracle.context.scale(panorama.oracle.width/1000, panorama.oracle.height/1000)

        window.onresize = () => {
            panorama.oracle.width = window.innerWidth
            panorama.oracle.height = window.innerHeight
            panorama.oracle.context.scale(panorama.oracle.width/1000, panorama.oracle.height/1000)
        }
    } 

    instantiatePanorama()

	panorama.loopFunction = function runPanorama() {
        panorama.oracle.context.clearRect(0, 0, 1000, 1000)
        panorama.oracle.context.drawImage(img, 110, 110);
        panorama.oracle.context.fillStyle = `red`
        panorama.oracle.context.rect(1,1,113,500)
        panorama.oracle.context.fill()

	}
	panorama.loopControl = setInterval(panorama.loopFunction, 33)
}