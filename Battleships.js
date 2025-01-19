//DRAWING GRID

//Theme control


//TRACKING GRID AND PLAYERS

var playerTurn = 0;

//0 = Empty, 1 = White Normal, 2 = Black Normal, 3 = White King, 4 = Black King
var playerGrids = [[], []];
var shotGrids = [[], []];

function GenerateBlankGrids(){
    let grid = [];
    for(let i = 0; i < 10; i++){
        grid.push([0,0,0,0,0,0,0,0,0,0]);
    }

    playerGrids[0] = structuredClone(grid);
    playerGrids[1] = structuredClone(grid);
    shotGrids[0] = structuredClone(grid);
    shotGrids[1] = structuredClone(grid);

}

function DrawGrid(grid, rowPrefix, cellPrefix){
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

document.querySelector('.playerBoard').addEventListener('click', function(event) {
    // Check if the clicked element is a cell

    if (event.target.classList.contains('cell')) {
        
        //PLACEMENT
        if(playerPlacement){
            let placementGrid = playerGrids[playerTurn];
            if(placedSquaresShip === 0){
                //Change type
                targetShipType += 1;
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
                if(!((placementGrid[targetLocation[0] + movementVector[0]][targetLocation[1] + movementVector[1]] === targetShipType) || (placementGrid[targetLocation[0] - movementVector[0]][targetLocation[1] - movementVector[1]] === targetShipType))){
                targetValid = false;
                }
            }

            if(targetValid){
                placementGrid[targetLocation[0]][targetLocation[1]] = targetShipType;
                placedSquaresShip -= 1; 
                
                console.log(`TESTING ${targetShipType}`);
                console.log(placementGrid);
                DrawGrid(placementGrid, "PlayerRow", "PlayerCell");
                positions.push(targetLocation);
            }

            
        }   
    }
}); 


//MAIN PROGRAM
window.onload = GenerateBlankGrids();
window.onload = DrawGrid(playerGrids[0], "PlayerRow", "PlayerCell");
window.onload = DrawGrid(shotGrids[0], "OtherRow", "OtherCell");