const RESOLUTION_WIDTH = 1080
const RESOLUTION_HEIGHT = 1960
const WATER_MARGIN_BOTTOM = 1700

class Rod {
    image = new Image()
    constructor () {
        this.image.src = './assets/fishing_rod.svg'
    }
    draw = (context) => {
        context.drawImage(this.image, RESOLUTION_WIDTH/2 - 100, RESOLUTION_HEIGHT - 780)
    }
    drawLine = (context, bait) => {
        context.beginPath();
        context.lineWidth = 1
        context.strokeStyle = 'white'
        context.moveTo(RESOLUTION_WIDTH/2 - 35, RESOLUTION_HEIGHT - 700);
        context.quadraticCurveTo(RESOLUTION_WIDTH/2 - 35, bait.y, bait.x, bait.y);
        context.stroke();
    }
}

class Bait {
    x = RESOLUTION_WIDTH/2
    y = RESOLUTION_HEIGHT
    radius = 10
    target = {
        x: this.x,
        dx: 0,
        y: this.y,
        dy: 0
    }
    pullDistance = 10
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    draw = (context) => {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();

    }
    throw = (angle, velocity) => {
        if (this.target.dx || this.target.dy) {
            return
        }
        const range = (Math.pow(velocity, 2) * 1) / 100 // Assuming 45° inclination
        
        this.target = {
            x: this.x + (Math.cos(angle) * range),
            dx: Math.cos(angle) * velocity,
            y: this.y + (Math.sin(angle) * range),
            dy: Math.sin(angle) * velocity,
        }
    }
    update = (delta) => {
        if (Math.abs(this.target.y - this.y) < Math.abs(this.target.dy * delta)) {
            this.x = this.target.x
            this.y = this.target.y
            this.target = {
                x: this.x,
                dx: 0,
                y: this.y,
                dy: 0
            }
            return
        } 
        this.x += this.target.dx * delta
        this.y += this.target.dy * delta
    }
    pull = () => {
        const bait_origin_x = RESOLUTION_WIDTH/2
        const bait_origin_y = RESOLUTION_HEIGHT
        this.x = bait_origin_x
        this.y = bait_origin_y
        this.target = {
            x: this.x,
            y: this.y,
            dx: 0,
            dy: 0,
        }
    }
}

class Fish {
    x
    y
    size
    variant
    image = new Image()
    constructor (x,y,size,variant) {
        this.x = x
        this.y = y
        this.size = size
        this.variant = variant
       
        switch(variant){
            case 0: this.image.src = './assets/purple_fish.svg'; break;
            case 1: this.image.src = './assets/red_fish.svg'; break;
            case 2: this.image.src = './assets/yellow_fish.svg'; break;
            default:  this.image.src = './assets/green_fish.svg';
        }
    }
    draw = (context) => {
        context.globalAlpha = 0.5
        context.drawImage(this.image, this.x, this.y, this.size, this.size)
        context.globalAlpha = 1
    }
    caughtBy = (bait) => {
        return (
            bait.x + bait.radius >= this.x && 
            bait.x - bait.radius <= this.x + this.size &&
            bait.y + bait.radius >= this.y &&
            bait.y - bait.radius <= this.y + this.size
        )
    }
    static spawnFish = () => {
        const x = Math.random() * RESOLUTION_WIDTH
        const y =  Math.random() * (RESOLUTION_HEIGHT - 400)
        const size = 50 + Math.random() * 50
        const variant = Math.floor(Math.random() * 3)
        return new Fish(x, y, size, variant)
    }
}

class Score {
    value = 0
    scoreFish = (fish) => {
        this.value += Math.floor((fish.variant + 1) * fish.size)
    }
    draw = (context) => {
        context.font = '50px Impact';
        context.fillStyle = 'White'
        context.fillText(`Score: ${this.value}`, 10, 50);
    }
}

const setUpOracle = () => {
    const oracle = document.getElementById('oracle')
    oracle.width = window.innerWidth
    oracle.height = window.innerHeight
    oracle.context = oracle.getContext('2d') 
    oracle.context.scale(oracle.width/RESOLUTION_WIDTH, oracle.height/RESOLUTION_HEIGHT)

    window.onresize = () => {
        oracle.width = window.innerWidth
        oracle.height = window.innerHeight
        oracle.context.scale(oracle.width/RESOLUTION_WIDTH, oracle.height/RESOLUTION_HEIGHT)
    }

    return oracle
    
}

const setUpPullBackListeners = (document, {handler, powerBar}) => {
    let p1 = {}
    let p2 = {}
    const getPullBackValues = () => {
        return {
            angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
            velocity: Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) ) / 2
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

const setupReelPullListener = (document, handler) => {
    document.addEventListener('click', ({clientX: x, clientY: y}) => {
        const reelX = oracle.width/2 - 30
        const reelWidth = 60
        const reelY = oracle.height-75
        const reelHeight = 75
        if (
            x >= reelX &&
            x <= reelX + reelWidth &&
            y >= reelY &&
            y <= reelY + reelHeight    
        ) {
            handler()
        }
    })
}

function beginPanorama() {
    const oracle = setUpOracle()
    const {context} = oracle

    const rod = new Rod()
    const bait = new Bait(RESOLUTION_WIDTH/2 - 35, RESOLUTION_HEIGHT - 700)
    bait.pull()
    const fishes = [Fish.spawnFish()]
    setInterval(() => {
        fishes.push(Fish.spawnFish())
    }, 10000)

    const pullBackHandler = ({angle, velocity}) => {
        bait.throw(angle, velocity)
    }
    setUpPullBackListeners(oracle, {handler: pullBackHandler})
    setupReelPullListener(oracle, () => {
        bait.pull()
    })

    const score = new Score()
    const handleFishCatching = () => {
        let scored = 0
        if (bait.target.dx !== 0 && bait.target.dy !== 0) return scored

        for (let i = 0; i < fishes.length; ++i) {
            if(fishes[i].caughtBy(bait)) {
                score.scoreFish(fishes[i])
                fishes.splice(i, 1)
                scored += 1
            }
        }
        return scored
    }

    const updateLoop = (loopDelta) => {
        bait.update(loopDelta)
        handleFishCatching()
    }
    const renderLoop = () => {
        context.clearRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT )
        fishes.map(fish => fish.draw(context))
        rod.draw(context)
        bait.draw(context)
        rod.drawLine(context, bait)
        score.draw(context)
    }
    const loopDelta = 0.033
	const loopFunction = () => {
        updateLoop(loopDelta)
        renderLoop()
	}
	const loopControl = setInterval(loopFunction, loopDelta * 1000)
}