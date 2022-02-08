/*ES5 (ecmaScript5) - Functions*/
var ctx;
var canvas;
var maze;
var mazeHeight;
var mazeWidth;
var player;
var level = 1;
var playerImage, targetImage;
var backgroundMusic = new Audio('./assets/audio/background.mp3');
var isPlaying = false;

/* player object initialization*/
function Player() {
    this.col = 0;
    this.row = 0;
    this.steps = 0;
}
/* initiating object cell properties */
function Cell(col, row) {
    this.col = col;
    this.row = row;

    this.right = true;
    this.up = true;
    this.down = true;
    this.left = true;

    this.visited = false;
}
/* maze */
function Maze(cols, rows, cellSize) {
    this.backgroundColor = "#cfa9f7" ;
  /*this.backgroundColor = "#7fffd4" ;*/
    this.mazeColor = "#000000";
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
/*Array*/
    this.cells = [];

    this.generate = function () {
        mazeHeight = this.rows * this.cellSize;
        mazeWidth = this.cols * this.cellSize;

        canvas.height = mazeHeight;
        canvas.width = mazeWidth;
        canvas.style.height = mazeHeight;
        canvas.style.width = mazeWidth;
        

        for (var col = 0; col < this.cols; col++) {
            this.cells[col] = [];
            for (var row = 0; row < this.rows; row++) {
                this.cells[col][row] = new Cell(col, row);
            }
        }
/* in stack push and pop, /depth first search/LIFO, pick random cell*/ 
        var rndCol = Math.floor(Math.random() * this.cols);
        var rndRow = Math.floor(Math.random() * this.rows);

        var stack = [];
        stack.push(this.cells[rndCol][rndRow]);

        var currCell;
        var dir;
        var foundNeighbor;
        var nextCell;

        while (this.hasUnvisited(this.cells)) {
            currCell = stack[stack.length - 1];
            currCell.visited = true;
            if (this.hasUnvisitedNeighbor(currCell)) {
                nextCell = null;
                foundNeighbor = false;
                do {
                    dir = Math.floor(Math.random() * 4);
                    switch (dir) {
                        case 0:
                            if (currCell.col !== (this.cols - 1) && !this.cells[currCell.col + 1][currCell.row].visited) {
                                currCell.right = false;
                                nextCell = this.cells[currCell.col + 1][currCell.row];
                                nextCell.left = false;
                                foundNeighbor = true;
                            }
                            break;
                        case 1:
                            if (currCell.row !== 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                                currCell.up = false;
                                nextCell = this.cells[currCell.col][currCell.row - 1];
                                nextCell.down = false;
                                foundNeighbor = true;
                            }
                            break;
                        case 2:
                            if (currCell.row !== (this.rows - 1) && !this.cells[currCell.col][currCell.row + 1].visited) {
                                currCell.down = false;
                                nextCell = this.cells[currCell.col][currCell.row + 1];
                                nextCell.up = false;
                                foundNeighbor = true;
                            }
                            break;
                        case 3:
                            if (currCell.col !== 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                                currCell.left = false;
                                nextCell = this.cells[currCell.col - 1][currCell.row];
                                nextCell.right = false;
                                foundNeighbor = true;
                            }
                            break;
                    }
                    if (foundNeighbor) {
                        stack.push(nextCell);
                    }
                } while (!foundNeighbor)
            } else {
                currCell = stack.pop();
            }
        }

        this.redraw();
    };
/* finding unvisited neighbour*/
    this.hasUnvisited = function () {
        for (var col = 0; col < this.cols; col++) {
            for (var row = 0; row < this.rows; row++) {
                if (!this.cells[col][row].visited) {
                    return true;
                }
            }
        }

        return false;
    };

    this.hasUnvisitedNeighbor = function (cell) {
        return ((cell.col !== 0 && !this.cells[cell.col - 1][cell.row].visited) ||
            (cell.col !== (this.cols - 1) && !this.cells[cell.col + 1][cell.row].visited) ||
            (cell.row !== 0 && !this.cells[cell.col][cell.row - 1].visited) ||
            (cell.row !== (this.rows - 1) && !this.cells[cell.col][cell.row + 1].visited));
    };
/*redraw maze*/
    this.redraw = function () {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, mazeHeight, mazeWidth);
/*defining area for target image, treasure box */
        ctx.drawImage(targetImage, (this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);
/* draw lines on canvas*/
        ctx.strokeStyle = this.mazeColor;
        ctx.strokeRect(0, 0, mazeHeight, mazeWidth);

        for (var col = 0; col < this.cols; col++) {
            for (var row = 0; row < this.rows; row++) {
                if (this.cells[col][row].right) {
                    ctx.beginPath();
                    ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
                if (this.cells[col][row].up) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, row * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
                    ctx.stroke();
                }
                if (this.cells[col][row].down) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
                if (this.cells[col][row].left) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, row * this.cellSize);
                    ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
            }
        }
/* draw player image on canvas*/
        ctx.drawImage(playerImage, (player.col * this.cellSize) + 2, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
    };
}
/* key strocks to count steps*/
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37:
        case 65:
            if (!maze.cells[player.col][player.row].left) {
                player.col -= 1;
                player.steps += 1;
            }
            break;
        case 39:
        case 68:
            if (!maze.cells[player.col][player.row].right) {
                player.col += 1;
                player.steps += 1;
            }
            break;
        case 40:
        case 83:
            if (!maze.cells[player.col][player.row].down) {
                player.row += 1;
                player.steps += 1;
            }
            break;
        case 38:
        case 87:
            if (!maze.cells[player.col][player.row].up) {
                player.row -= 1;
                player.steps += 1;
            }
            break;
        default:
            break;
    }

    if (player.row == (maze.rows - 1) && player.col == (maze.cols - 1)) {
        claphands();
        document.getElementById("playerSteps").innerText = player.steps;
        changeStep("step4");
    }
    else {
        maze.redraw();
    }
}

function onLevelChange() {
    level = parseInt(event.target.value);
}
/* 2 dimension canvas for 4 levels  cols,rows and cell height*/
function setupGame() {
    canvas = document.getElementById("gamecv");
    ctx = canvas.getContext("2d");

    player = new Player();

    switch (level) {
        case 1:
            maze = new Maze(10, 10, 20);
            break;
        case 2:
            maze = new Maze(15, 15, 20);
            break;
        case 3:
            maze = new Maze(20, 20, 20);
            break;
        case 4:
            maze = new Maze(25, 25, 20);
            break;
    }

    maze.generate();
}

function changeStep(activeStep) {
    var steps = document.getElementsByClassName('step');

    for (var i = 0; i < steps.length; i++) {
        var el = steps[i];
        if (el.classList.contains(activeStep)) {
            el.style.display = '';
        }
        else {
            el.style.display = 'none';
        }
    }
}
/* on new page player and tresure*/
function onLoad() {
    changeStep("step1");
    document.addEventListener("keydown", onKeyDown);
    playerImage = new Image();
    playerImage.src = './assets/images/sprite.png';
    targetImage = new Image();
    targetImage.src = './assets/images/finishSprite.png';
}

const claphands = () => {
    const clap = new Audio('./assets/audio/applause2.mp3');
    backgroundMusic.pause();
    clap.play();
  }

const playMusic = () => {
    isPlaying ? backgroundMusic.pause() : backgroundMusic.play(); 
} 