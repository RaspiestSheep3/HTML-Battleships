// Constants
const css = document.documentElement.style;
const cssRead = getComputedStyle(document.documentElement);

const shipDict = new Map([
    [1, ["Destroyer", 2]],
    [2, ["Submarine", 3]],
    [3, ["Cruiser", 3]],
    [4, ["Battleship", 4]],
    [5, ["Carrier", 5]],
]);

const sunkShipNumDict = new Map([
    [1, 9],
    [2, 10],
    [3, 11],
    [4, 12],
    [5, 13]
]);

// Gameplay Variables
var playerTurn = 0; // 0 = Player 1, 1 = Player 2
var playerGrids = [[], []]; // Each player's ship grid
var shotGrids = [[], []];   // Each player's shot grid
var blankGrid = [];         // Empty grid for display

// Ship Placement Variables
var playerPlacement = true; // Whether ships are still being placed
var targetShipType = 0;     // Type of ship being placed
var placedSquaresShip = 0;  // Remaining squares to place for the current ship
var positions = [];         // Positions of placed ship parts
var movementVector = [0, 0]; // Direction of placement
var shipsLeft = [0,0];

// Screen Switching Variables
var switchStarted = false;       // Whether switching is in progress
var canSwitch = false;           // Whether switching is allowed
var placementSwitchOccured = false; // Whether placement switch happened

// Functions
function GenerateBlankGrids() {
    let grid = [];
    for (let i = 0; i < 10; i++) {
        grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    playerGrids[0] = structuredClone(grid);
    playerGrids[1] = structuredClone(grid);
    shotGrids[0] = structuredClone(grid);
    shotGrids[1] = structuredClone(grid);
    blankGrid = structuredClone(grid);
}

function DrawGrid(grid, rowPrefix, cellPrefix, shouldCalculateShips = false) {
    // Turn display
    if(shouldCalculateShips) shipsLeft[playerTurn] = 0;

    let turnDisplay = document.getElementById("turnDisplay");
    if (switchStarted) turnDisplay.innerHTML = `<h2 class="displayText">Switching</h2>`;
    else turnDisplay.innerHTML = `<h2 class="displayText">It is Player ${playerTurn + 1}'s Turn</h2>`;

    let imageFolder = "Images";
    let filePrefix = "Battleships_";

    let imageDictionary = new Map([
        [0, `${imageFolder}/${filePrefix}00.png`],
        [1, `${imageFolder}/${filePrefix}01.png`],
        [2, `${imageFolder}/${filePrefix}02.png`],
        [3, `${imageFolder}/${filePrefix}03.png`],
        [4, `${imageFolder}/${filePrefix}04.png`],
        [5, `${imageFolder}/${filePrefix}05.png`],
        [6, `${imageFolder}/${filePrefix}06.png`],
        [7, `${imageFolder}/${filePrefix}07.png`],
        [8, `${imageFolder}/${filePrefix}08.png`],
        [9, `${imageFolder}/${filePrefix}09.png`],
        [10, `${imageFolder}/${filePrefix}10.png`],
        [11, `${imageFolder}/${filePrefix}11.png`],
        [12, `${imageFolder}/${filePrefix}12.png`],
        [13, `${imageFolder}/${filePrefix}13.png`],
    ]);

    for (let i = 0; i < 10; i++) {
        let row = document.getElementById(rowPrefix + String(i));
        let line = "";

        for (let j = 0; j < 10; j++) {
            if(shouldCalculateShips && (grid[i][j] !== 0)) shipsLeft[playerTurn] = shipsLeft[playerTurn] + 1;
            //console.log(shipsLeft);
            line += `<img class= "cell" id = "${cellPrefix} ${i} ${j}" src="${imageDictionary.get(grid[i][j])}">`;
        }

        row.innerHTML = line;
    }

    let scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.innerHTML = `<h2 class="displayText">Player 1 : ${shipsLeft[0]}</h2>`;
    scoreDisplay.innerHTML += `<h2 class="displayText">Player 2 : ${shipsLeft[1]}</h2>`;
}

document.querySelector('.playerBoard').addEventListener('click', function (event) {
    if (event.target.classList.contains('cell')) {
        // Placement
        if (playerPlacement && !canSwitch) {
            let placementGrid = playerGrids[playerTurn];
            if (placedSquaresShip === 0) {
                // Change type
                targetShipType += 1;
                placedSquaresShip = shipDict.get(targetShipType)[1];
                positions = [];
            }

            let cellId = event.target.id;
            let targetLocation = [Number(cellId[cellId.length - 3]), Number(cellId[cellId.length - 1])];

            targetValid = true;

            // Check if target location is empty
            if (!(placementGrid[targetLocation[0]][targetLocation[1]] === 0)) targetValid = false;

            // Placement next to others
            if (placedSquaresShip < shipDict.get(targetShipType)[1]) {
                if (!((targetLocation[0] - 1 > -1 && placementGrid[targetLocation[0] - 1][targetLocation[1]] === targetShipType) ||
                      (targetLocation[0] + 1 < 10 && placementGrid[targetLocation[0] + 1][targetLocation[1]] === targetShipType) ||
                      (targetLocation[1] - 1 > -1 && placementGrid[targetLocation[0]][targetLocation[1] - 1] === targetShipType) ||
                      (targetLocation[1] + 1 < 10 && placementGrid[targetLocation[0]][targetLocation[1] + 1] === targetShipType))) {
                    targetValid = false;
                }
            }

            // Placement in a line
            if (placedSquaresShip < shipDict.get(targetShipType)[1] - 1) {
                movementVector = [positions[1][0] - positions[0][0], positions[1][1] - positions[0][1]];

                let vectorAllowed = true;
                let negativeVectorAllowed = true;

                vectorAllowed = (targetLocation[1] + movementVector[1] < 10 && targetLocation[1] + movementVector[1] > -1 &&
                                 targetLocation[0] + movementVector[0] > -1 && targetLocation[0] + movementVector[0] < 10 &&
                                 placementGrid[targetLocation[0] + movementVector[0]][targetLocation[1] + movementVector[1]] === targetShipType);

                negativeVectorAllowed = (targetLocation[1] - movementVector[1] < 10 && targetLocation[1] - movementVector[1] > -1 &&
                                         targetLocation[0] - movementVector[0] > -1 && targetLocation[0] - movementVector[0] < 10 &&
                                         placementGrid[targetLocation[0] - movementVector[0]][targetLocation[1] - movementVector[1]] === targetShipType);

                if (!(vectorAllowed || negativeVectorAllowed)) targetValid = false;
            }

            if (targetValid) {
                placementGrid[targetLocation[0]][targetLocation[1]] = targetShipType;
                placedSquaresShip -= 1;

                DrawGrid(placementGrid, "PlayerRow", "PlayerCell", true);
                positions.push(targetLocation);
            }

            if (placedSquaresShip === 0 && targetShipType === 5) {
                if (playerTurn == 1) playerPlacement = false;
                else {
                    targetShipType = 0;
                    positions = [];
                }
                canSwitch = true;
            }
        }
    }
});

document.querySelector('.switchButton').addEventListener('click', function (event) {
    if (canSwitch) {
        if (!switchStarted) {
            switchStarted = true;
            css.setProperty("--switchButtonColour", cssRead.getPropertyValue("--switchButtonColourActive"));
            DrawGrid(blankGrid, "PlayerRow", "PlayerCell");
            DrawGrid(blankGrid, "OtherRow", "OtherCell");
        } else {
            switchStarted = false;
            canSwitch = false;
            playerTurn = (playerTurn + 1) % 2;

            if (playerPlacement) placementSwitchOccured = true;

            css.setProperty("--switchButtonColour", css.getPropertyValue("--backgroundColour"));
            DrawGrid(playerGrids[playerTurn], "PlayerRow", "PlayerCell");
            DrawGrid(shotGrids[playerTurn], "OtherRow", "OtherCell");
        }
    }
});

function CheckForSunkShip(pPlayerTurn, numToCheck) {
    let shotBoard = shotGrids[pPlayerTurn];
    let playerBoard = playerGrids[(pPlayerTurn + 1) % 2]; 

    let positions = [];
    for(let i = 0; i < playerBoard.length; i++){
        for(let j = 0; j < playerBoard[i].length;j++){
            if((playerBoard[i][j] === numToCheck) && (shotBoard[i][j] !== 0))
                positions.push([i,j])
        }
    }

    if(positions.length === shipDict.get(numToCheck)[1]){
        for(let position of positions){
            console.log(`POSITON ${position} ${playerBoard[position[0]][position[1]]}`);
            shotGrids[playerTurn] = sunkShipNumDict.get(playerBoard[position[0]][position[1]]);
        }
    }

}

document.querySelector('.otherBoard').addEventListener("click", function (event) {

    if(!playerPlacement && event.target.classList.contains('cell') && !canSwitch){
        let cellId = event.target.id;
        let targetLocation = [Number(cellId[cellId.length - 3]), Number(cellId[cellId.length - 1])];
        let shotBoard = shotGrids[playerTurn];
        let otherBoard = playerGrids[(playerTurn + 1) % 2];

        if(otherBoard[targetLocation[0]][targetLocation[1]] !== 0){
            //Hit
            shotBoard[targetLocation[0]][targetLocation[1]] = 7;
            shipsLeft[(playerTurn + 1) % 2] = shipsLeft[(playerTurn + 1) % 2] - 1;
            CheckForSunkShip(playerTurn, otherBoard[targetLocation[0]][targetLocation[1]]);
        }
        else {
            //Miss
            shotBoard[targetLocation[0]][targetLocation[1]] = 8;
        }

        DrawGrid(shotGrids[0], "OtherRow", "OtherCell");
        canSwitch = true;

    }

});

// Main Program
window.onload = GenerateBlankGrids();
window.onload = DrawGrid(playerGrids[0], "PlayerRow", "PlayerCell");
window.onload = DrawGrid(shotGrids[0], "OtherRow", "OtherCell");
