let columns, rows, snakePrev = document.createElement("div")
let score = 3,
    size = 2,
    appleCount = 0,
    timer = 0,
    pace = 500

let screenWidth = window.screen.width,
    screenHeight = window.screen.height,
    ratio = screenWidth/screenHeight

function loadGame() {
    let game = document.querySelector("#game")

    size = prompt("podaj rozmiar planszy") || 2
    columns = (ratio>1) ? 16*size : 9*size
    rows = (ratio>1) ? 9*size : 16*size

    if (ratio<1) document.querySelector("#movement").style.visibility = "visible"

    game.style.gridTemplateColumns = `repeat(${columns},${100/columns}%)`
    game.style.gridTemplateRows = `repeat(${columns},${100/rows}%)`

    document.addEventListener('keydown', e=>directionHandler(e));

    for (let y=0; y<rows; y++) {
        for (let x = 0; x<columns; x++) {
            let square = document.createElement("div")
            square.classList.add("background")
            square.id = `x${x}y${y}`
            square.innerText = 0
            game.appendChild(square)
        }
    }
}

function directionHandler(event, b=0) {
    let code = (event) ? event.keyCode : b
    if (code == 37 && snake.direction != 'right') {
        snake.direction = 'left'
    }
    else if (code == 38 && snake.direction != 'down') {
        snake.direction = 'up'
    }
    else if (code == 39 && snake.direction != 'left') {
        snake.direction = 'right'
    }
    else if (code == 40 && snake.direction != 'up') {
        snake.direction = 'down'
    }
}

let snake = {
    x: 1,
    y: 1,
    direction: 'right'
}

async function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve,ms))
}

function moveSnake() {
    switch(snake.direction) {
        case 'left':
            snake.x--
            break
        case 'up':
            snake.y--
            break
        case 'right':
            snake.x++
            break
        case 'down':
            snake.y++
            break
    }
}

function updateSnake(x=0,y=0) {
    let cell = document.getElementById(`x${x}y${y}`)

    if (cell == null) {
        gameOver()
    }

    snakePrev.classList.remove("snake-head")
    snakePrev.classList.add("snake")

    if(cell.classList.contains("background")) {
        cell.classList.add("snake-head")
        cell.classList.remove("background")
    }
    else if (cell.classList.contains("apple")) {
        cell.classList.remove("apple")
        appleCount--
        score++
    }
    else if (cell.classList.contains("bomb")) {
        cell.classList.remove("bomb")
        cell.classList.add("background")
        cell.innerText = 0
        spawn(1,"bomb")
    }
    else if (cell.classList.contains("snake")) {
        gameOver()
    }
    else if (cell.classList.contains("destroyed")) {
        gameOver()
    }
    cell.innerText = score
    
    snakePrev = cell

    reduceSnake()
}

function reduceSnake() {
    let cells = document.querySelectorAll(".snake")
    cells.forEach(cell => {
        cell.innerText--
        if(cell.innerText == 0) {
            cell.classList.remove("snake")
            cell.classList.add("background")
        }
    });
}

function spawn(amount=1, thing="apple") {
    for (let i=0; i<amount; i++) {
        let x = Math.floor(Math.random()*columns)
        let y = Math.floor(Math.random()*rows)

        let cell = document.querySelector(`#x${x}y${y}`)
        if ( cell.classList.contains("background")) {
            cell.classList.add(thing)
            cell.classList.remove("background")

            switch (thing) {
                case "apple":
                    appleCount++
                    break
                case "bomb":
                    cell.innerText = pace/1000 * 60 * size**2 /2
                    break
                default:
                    break
            }
        }
        else {
            spawn(amount, thing)
        }
    }
}

function updateBomb() {
    let bombs = document.querySelectorAll(".bomb")
    bombs.forEach(bomb => {
        if (bomb.innerText>0) {
            bomb.innerText -= 1
        }
        else {
            let coords = bomb.id.substring(1).split("y")
            coords = coords.map(x => +x)
            
            let x1 = coords[0]
            let y1 = coords[1]
            let radius = 2
            for (let x = x1-radius; x<=x1+radius; x++) {
                for (let y = y1-radius; y<=y1+radius;y++) {
                    let cell = document.querySelector(`#x${x}y${y}`)
                    if (cell) {
                        if(cell.classList.contains("apple")) {
                            cell.classList.remove("apple")
                            appleCount--
                        }
                        cell.classList.remove("bomb")
                        cell.classList.remove("background")
                        cell.classList.add("destroyed")
                    }
                }
            }
            spawn(1, "bomb")
        }
    });
}

const game = async () => {
    await loadGame()

    spawn(1, "bomb")
    
    while (true) {
        moveSnake()
        updateSnake(snake.x, snake.y)
        updateBomb()

        if(appleCount==0) {
            spawn(2, "apple")
        }

        await sleep(pace)
    }
}

function gameOver() {
    alert(`GG, twój wynik to ${score}`)
    window.location.reload()
}

game()

