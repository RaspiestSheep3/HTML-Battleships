//DRAWING GRID

//Theme control

var switchStarted = false;
var canSwitch = false;
var placementSwitchOccured = false;

//TRACKING GRID AND PLAYERS

var playerTurn = 0;

//0 = Empty, 1 = White Normal, 2 = Black Normal, 3 = White King, 4 = Black King
var playerGrids = [[], []];
var shotGrids = [[], []];
var blankGrid = [];

function GenerateBlankGrids(){
    let grid = [];
    for(let i = 0; i < 10; i++){
        grid.push([0,0,0,0,0,0,0,0,0,0]);
    }

    playerGrids[0] = structuredClone(grid);
    playerGrids[1] = structuredClone(grid);
    shotGrids[0] = structuredClone(grid);
    shotGrids[1] = structuredClone(grid);
    blankGrid = structuredClone(grid);

}

function DrawGrid(grid, rowPrefix, cellPrefix){
    //Turn display
    let turnDisplay = document.getElementById("turnDisplay");
    if(switchStarted) turnDisplay.innerHTML = `<h2 class="displayText">Switching</h2>`;
    else turnDisplay.innerHTML = `<h2 class="displayText">It is Player ${playerTurn + 1}'s Turn</h2>`;
    
    let imageFolder = "Images";
    let filePrefix = "Battleships_";

    let imageDictionary = new Map([
        [0, `${imageFolder}/${filePrefix}0.png`],
        [1, `${imageFolder}/${filePrefix}1.png`],
        [2, `${imageFolder}/${filePrefix}2.png`],
        [3, `${imageFolder}/${filePrefix}3.png`],
        [4, `${imageFolder}/${filePrefix}4.png`],
        [5, `${imageFolder}/${filePrefix}5.png`],
        [6, `${imageFolder}/${filePrefix}6.png`]
    ]);

    for(let i = 0; i < 10; i++){
        let row = document.getElementById(rowPrefix + String(i));;
        let line = "";

        for(let j = 0; j < 10; j++){
            line += `<img class= "cell" id = "${cellPrefix} ${i} ${j}" src="${imageDictionary.get(grid[i][j])}">`;
            //console.log(`${imageDictionary.get(grid[i][j])} ${i} ${j} ${rowPrefix + String(i)}`);
        }

        row.innerHTML = line;
        //console.log(line);
        
    }
}

//USER INPUT
var playerPlacement = true;
var targetShipType = 0; 

var shipDict = new Map([
    [1, ["Destroyer", 2]],
    [2, ["Submarine", 3]],
    [3, ["Cruiser", 3]],
    [4, ["Battleship", 4]],
    [5, ["Carrier", 5]]
]);

var placedSquaresShip = 0;
var positions = [];
var movementVector = [0,0];

//Screen Switching
const css = document.documentElement.style;
const cssRead = getComputedStyle(document.documentElement);

document.querySelector('.playerBoard').addEventListener('click', function(event) {
    // Check if the clicked element is a cell

    if (event.target.classList.contains('cell')) {
        
        //PLACEMENT
        if(playerPlacement && !(canSwitch)){
            let placementGrid = playerGrids[playerTurn];
            if(placedSquaresShip === 0){
                //Change type
                targetShipType += 1;
                //console.log(targetShipType);
                placedSquaresShip = shipDict.get(targetShipType)[1];
                positions = [];
            }
            
            let cellId = event.target.id;

            let targetLocation = [Number(cellId[cellId.length - 3]), Number(cellId[cellId.length - 1])];

            targetValid = true;

            
            //Checking targetLocation is empty
            if(!(placementGrid[targetLocation[0]][targetLocation[1]] === 0)) targetValid = false;

            //Placement next to others
            if(placedSquaresShip < shipDict.get(targetShipType)[1]){
                    if(!((targetLocation[0] - 1 > -1) && (placementGrid[targetLocation[0] - 1][targetLocation[1]] === targetShipType)
                        || (targetLocation[0] + 1 < 10) && (placementGrid[targetLocation[0] + 1][targetLocation[1]] === targetShipType)
                        || (targetLocation[1] - 1 > -1) && (placementGrid[targetLocation[0]][targetLocation[1] - 1] === targetShipType)
                        || (targetLocation[1] + 1 < 10) && (placementGrid[targetLocation[0]][targetLocation[1] + 1] === targetShipType))){
                        targetValid = false;
                    }
            }

            //Placement in a line
            if(placedSquaresShip < shipDict.get(targetShipType)[1] - 1){
                movementVector = [positions[1][0] - positions[0][0] , positions[1][1] - positions[0][1]];

                console.log(`MOVEMENT VECTOR ${JSON.stringify(movementVector)} ${JSON.stringify(positions)}`);
                let vectorAllowed = true;
                let negativeVectorAllowed = true;
                
                vectorAllowed =(targetLocation[1] + movementVector[1] < 10) && (targetLocation[1] + movementVector[1] > -1) && (targetLocation[0] + movementVector[0] > -1) && (targetLocation[0] + movementVector[0] < 10) && (placementGrid[targetLocation[0] + movementVector[0]][targetLocation[1] + movementVector[1]] === targetShipType);
                negativeVectorAllowed =(targetLocation[1] - movementVector[1] < 10) && (targetLocation[1] - movementVector[1] > -1) && (targetLocation[0] - movementVector[0] > -1) && (targetLocation[0] - movementVector[0] < 10) && (placementGrid[targetLocation[0] - movementVector[0]][targetLocation[1] - movementVector[1]] === targetShipType);


                if(!(vectorAllowed || negativeVectorAllowed)){
                    targetValid = false;
                }
            }

            if(targetValid){
                placementGrid[targetLocation[0]][targetLocation[1]] = targetShipType;
                placedSquaresShip -= 1; 
                
                //console.log(`TESTING ${targetShipType}`);
                //console.log(placementGrid);
                DrawGrid(placementGrid, "PlayerRow", "PlayerCell");
                positions.push(targetLocation);
            }

            if(placedSquaresShip === 0 && targetShipType === 5){
                if(playerTurn == 1) playerPlacement = false ;
                else{
                    targetShipType = 0;
                    positions = [];
                }
                canSwitch = true;
            } 
            console.log(`TURN ${playerTurn} SHIPTYPE ${targetShipType} CANSWITCH ${canSwitch}`);
        }   

    }
}); 

document.querySelector('.switchButton').addEventListener('click', function(event) {
    if(canSwitch){
        if((!switchStarted)){
            console.log(` ORG ${cssRead.getPropertyValue("--switchButtonColour")}`);
            switchStarted = true;
            console.log("SWITCH STARTED");
            //css.setProperty("--switchButtonColour", cssRead.getPropertyValue("--switchButtonColourActive"));
            
            //PROBLEM LINE
            css.setProperty("--switchButtonColour", cssRead.getPropertyValue("--switchButtonColourActive"));
            DrawGrid(blankGrid, "PlayerRow", "PlayerCell");
            DrawGrid(blankGrid, "OtherRow", "OtherCell");

            console.log(` NEW ${cssRead.getPropertyValue("--switchButtonColour")}`);
        }
        else{
            switchStarted = false;
            canSwitch = false;
            playerTurn = (playerTurn + 1) % 2;

            console.log("SWITCH COMPLETE");

            if(playerPlacement) placementSwitchOccured = true;

            css.setProperty("--switchButtonColour", css.getPropertyValue("--backgroundColour"));
            DrawGrid(playerGrids[playerTurn], "PlayerRow", "PlayerCell");
            DrawGrid(shotGrids[playerTurn], "OtherRow", "OtherCell");
        }
    }
});


//MAIN PROGRAM
window.onload = GenerateBlankGrids();
window.onload = DrawGrid(playerGrids[0], "PlayerRow", "PlayerCell");
window.onload = DrawGrid(shotGrids[0], "OtherRow", "OtherCell");