var screen = document.getElementById("canvas");
var ctx = screen.getContext("2d");
canvasFillScreen();

// GLOBAL VARIABLES
var isPlaying = true;
var isDayView = false;
var highScore = null;
var isFirstRound = true;

// CONSTANTS
let GRID_SIZE = 17;
let SPEED = 27;
let CONST_GROWTH = 5;

// COLORS!!! :)

let DAY_BACKGROUND = "#EEE";
let DAY_CELL_COLOR = "#AAA";
let DAY_FOOD_COLOR = "#BBB";
let DAY_SCORE_COLOR = "#DDD";
let NIGHT_BACKGROUND = "#000";
let NIGHT_CELL_COLOR = "#BBB";
let NIGHT_FOOD_COLOR = "#CCC";
let NIGHT_SCORE_COLOR = "#333";
let DEAD_CELL_COLOR = "#b32400";


var Cell = function(x,y){
    this.x = (x + Grid.width) % Grid.width;
    this.y = (y + Grid.height) % Grid.height;
}

var Grid = {
    init: function (){
        this.width = Math.floor(screen.width / GRID_SIZE);
        this.height = Math.floor(screen.height / GRID_SIZE);
        this.offsetX = Math.floor((screen.width % GRID_SIZE) / 2);
        this.offsetY = Math.floor((screen.height % GRID_SIZE) / 2);
        },
    draw: function(Cell){
        
        ctx.fillRect(Grid.offsetX + Cell.x * GRID_SIZE, Grid.offsetY + Cell.y * GRID_SIZE, GRID_SIZE,GRID_SIZE);
    }
}

Grid.init();

var Snake = {
    body: [new Cell(Math.floor(Grid.width/2), Math.floor(Grid.height/2))],
    length: 5,
    instructions: [],
    lastDirection: "right",
    draw: function(){
        for(var i = 0; i < Snake.body.length;i++){
            Grid.draw(this.body[i]);
            }
        },

    isTryingToGoBackwards: function(){
        switch (Snake.instructions[0]){
            case "up":
                if(Snake.lastDirection == "down"){return true;};
                break;
            case "right":
                if(Snake.lastDirection == "left"){return true;};
                break;
            case "down":
                if(Snake.lastDirection == "up"){return true;};
                break;
            case "left":
                if(Snake.lastDirection == "right"){return true;};
                break;
            default:
                break;
        }
        return false;
    },
    getNextDirection: function(){
        var nextDirection;
        // lets avoid a dumb death
        if(this.isTryingToGoBackwards()){
            this.instructions.shift();
            nextDirection = this.lastDirection;
        } else if(this.instructions.length != 0){
            nextDirection = this.instructions[0];
            // save this for future referece
            this.lastDirection = this.instructions[0];
            // get rid of this instruction after we used it;
            this.instructions.shift();
            } else {
                 nextDirection = this.lastDirection;
                }
        return nextDirection;
        },

    findNextCell: function(){
        var nextCell = new Cell(this.body[0].x,this.body[0].y);
        switch(this.getNextDirection()){
            case "up":
            nextCell.y--;
            break;
            case "down":
            nextCell.y++;
            break;
            case "left":
            nextCell.x--;
            break;
            case "right":
            nextCell.x++;
            break;
            default:
            console.log("ummm....");
            break;
            }
        return new Cell(nextCell.x,nextCell.y);
        },

    update: function(){
        // add the direction to the head and "unshift()" that to the front of the array
        this.body.unshift(this.findNextCell());
        // check to see if we are a cannibal
        for(var i = 1; i < this.body.length; i++){
            if(this.body[0].x == this.body[i].x &&
               this.body[0].y == this.body[i].y){
                isPlaying = false;
                isFirstRound = false;
                window.setTimeout(function(){Snake.reset("right")},500);
                }
            }
        // check if we found the actual food
        if(Snake.body[0].x == food.x && Snake.body[0].y == food.y){
            Snake.length += food.worth;
            food.findNewPlace();
            }
        // then pop the back of the array off if it is it's full size
        if(Snake.body.length > Snake.length){
            this.body.pop();
            }
        if(Snake.length > highScore){
            highScore = Snake.body.length;
            }
        //console.log(this.body.length);
        },
    
    reset: function(direction){
        isPlaying = true;
        this.body = [new Cell(Math.floor(Grid.width/2), Math.floor(Grid.height/2))];
        this.length = 5;
        this.instructions = [];
        // this.lastDirection = direction;
    }
}

var food = {
    x : Math.floor(Math.random() * (Grid.width-1)),
    y : Math.floor(Math.random() * (Grid.height-1)),
    worth : CONST_GROWTH,
    findNewPlace : function(){
        this.x = Math.floor(Math.random() * (Grid.width-1));
        this.y = Math.floor(Math.random() * (Grid.height-1));
        for(var i = 0; i < Snake.body.length; i++){
            if(Snake.body[i].x == this.x && Snake.body[i].y == this.y){
                this.findNewPlace();
                }
            }
        },
    draw : function(){
        Grid.draw(new Cell(this.x,this.y));
        }
}

function update(){
    if(isPlaying){Snake.update();}
}

function draw(){
    // background
    ctx.fillStyle = isDayView ? DAY_BACKGROUND : NIGHT_BACKGROUND;
    ctx.fillRect(0,0,screen.width,screen.height);

    ctx.fillStyle = isDayView ? DAY_SCORE_COLOR : NIGHT_SCORE_COLOR;
    ctx.font = "100px Verdana";
    ctx.fillText(Snake.body.length,40,120);
    ctx.font = "40px Verdana";
    if(!isFirstRound){ctx.fillText(highScore,45,175);}

    ctx.fillStyle = isDayView ? DAY_FOOD_COLOR : NIGHT_FOOD_COLOR;
    food.draw();
    
    ctx.fillStyle = isDayView ? DAY_CELL_COLOR : NIGHT_CELL_COLOR;
    Snake.draw();

    if(!isPlaying){
        ctx.fillStyle = DEAD_CELL_COLOR;
        Grid.draw(Snake.body[0]);
    }
}

function canvasFillScreen(){
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
}

function init(){
    canvasFillScreen();
    Grid.init();
    draw();
}

/* Keyboard Handler */
{
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Should do nothing if the key event was already consumed.
            }
        // 187 +
        // 189 -
        
        //alert(event.keyCode);
        switch(event.keyCode) {
            case 65: // a
            case 37: // <-
                Snake.instructions.push("left");
                break;
            case 87: // w
            case 38: // ^
                Snake.instructions.push("up");
                break;
            case 68: // d
            case 39: // ->
                Snake.instructions.push("right");
                break;
            case 83: // s
            case 40: // v
                Snake.instructions.push("down");
                break;
            case 86: // V
                isDayView = !isDayView;
                break;
            default:
            return;
            }
        
        // Consume the event to avoid it being handled twice
        event.preventDefault();
        }, true);
}


setInterval(function(){
     update();
     draw(); 
    }, 1000/SPEED);

window.onresize = init;
