class Bait {
    x = oracle.width/2
    y = oracle.height
    radius = 20
    target = {
        x: this.x,
        dx: 0,
        y: this.y,
        dy: 0
    }
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    draw = (context) => {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    }
    throw = (angle, velocity) => {
        const range = (Math.pow(velocity, 2) * 1) / 10 // Assuming 45° inclination

        this.target = {
            x: this.x + (Math.cos(angle) * range),
            dx: Math.cos(angle) * velocity,
            y: this.y + (Math.sin(angle) * range),
            dy: Math.sin(angle) * velocity,
        }
    }
    update = (delta) => {
        console.log(this.x, this.y, this.target)
        if (Math.pow(this.target.x - this.x, 2) <= Math.pow(this.target.dx, 2)) {
            console.log("reached")
            return
        } 
        this.x += this.target.dx * delta
        this.y += this.target.dy * delta
    }
}

const setUpPanorama = () => {
    const oracle = document.getElementById('oracle')
    oracle.width = window.innerWidth
    oracle.height = window.innerHeight
    oracle.context = oracle.getContext('2d') 
    oracle.context.scale(oracle.width/1000, oracle.height/1000)

    window.onresize = () => {
        oracle.width = window.innerWidth
        oracle.height = window.innerHeight
        oracle.context.scale(oracle.width/1000, oracle.height/1000)
    }

    return {
        oracle,
    }
}

const setUpPullBackListeners = (document, handler) => {
    let p1 = {}
    let p2 = {}
    const getPullBackValues = () => {
        return {
            angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
            velocity: Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) ) / 5
        }
    }
    document.addEventListener('mousedown', ({screenX, screenY}) => {
        p2 = {x: screenX, y: screenY}
    })

    document.addEventListener('mouseup', ({screenX, screenY}) => {
        p1 = {x: screenX, y: screenY}
        handler(getPullBackValues())
    })
}

function beginPanorama() {
    const {oracle} = setUpPanorama()
    const {context} = oracle

    const bait = new Bait(oracle.width/2, oracle.height)

    const pullBackHandler = ({angle, velocity}) => {
        bait.throw(angle, velocity)
    }
    setUpPullBackListeners(oracle, pullBackHandler)


    const loopDelta = 0.033
	loopFunction = function runPanorama() {
        context.clearRect(0, 0, 1000, 1000)
        bait.update(loopDelta)
        bait.draw(context)
	}
	const loopControl = setInterval(loopFunction, loopDelta * 1000)
}