const pf = require('pathfinding');

let route = {
    createWallX: function (x, length, start) {
        for (var i = start; i < length; i++) {
          grid.setWalkableAt(i, x, false);
        }
      },
      
      createWallY = function (y, length, start) {
        for (var i = start; i < length; i++) {
          grid.setWalkableAt(y, i, false);
        }
      },
      
      createDoorX = function (x, length, start) {
        for (var i = start; i < length; i++) {
          grid.setWalkableAt(i, x, true);
        }
      },
      
      createDoorY = function (y, length, start) {
        for (var i = start; i < length; i++) {
          grid.setWalkableAt(y, i, true);
        }
      },
      grid: new pf.Grid(11, 11),

}

export default route;