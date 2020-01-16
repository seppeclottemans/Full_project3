const pf = require('./node_modules/pathfinding');

/*
interesting functions:

 1. route.calculatePath(loc1, loc2)
 loc = [x, y]

 2. route.closestArt: function(currentLocation, artLocations)
 currentLocation = [x,y]
 artLocations = {
    locations: [[x , y], [x , y], [x,y],[x,y]],
    id: [id, id, id, id]
    // they need to be in the same order !!!!
 }



*/

const route = {
    grid: new pf.Grid(11, 11),
    createWallX: function (x, length, start) {
        for (let i = start; i < length; i++) {
          this.grid.setWalkableAt(i, x, false);
        }
      },
      
      createWallY: function (y, length, start) {
        for (let i = start; i < length; i++) {
          this.grid.setWalkableAt(y, i, false);
        }
      },
      
      createDoorX: function (x, length, start) {
        for (let i = start; i < length; i++) {
          this.grid.setWalkableAt(i, x, true);
        }
      },
      
      createDoorY: function (y, length, start) {
        for (let i = start; i < length; i++) {
          this.grid.setWalkableAt(y, i, true);
        }
      },
      finder: new pf.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
      }),
      calculatePath: function(loc1, loc2){
          //Sthis.createWalls();
          let gridBackup = this.grid.clone();
          let loc1x = loc1[0];
          let loc1y = loc1[1];
          let loc2x = loc2[0];
          let loc2y = loc2[1];
          let path = this.finder.findPath(loc1x, loc1y, loc2x, loc2y, this.grid);
          this.grid = gridBackup;
          let distance = pf.Util.pathLength(path);
          return {path: path, distance: distance};

      },
       createWalls: function(){
        this.createWallX(5, 5, 0);
        this.createWallY(5, 11, 0);
        this.createDoorX(5, 1, 3);
        this.createDoorY(5, 1, 3);
        this.createDoorY(5, 1, 7);
       },

       closestArt: function(currentLocation, artLocations){
            let distances = [];
          artLocations.locations.forEach(function(e){
              let path = route.calculatePath(currentLocation, e);
              distances.push(path.distance);
          });
          let smallestDistance =  Math.min(...distances);
        //this.calculatePath(locItem1,locItem2);
        let indexSmallestDistance = distances.findIndex(function(e){
            if(e === smallestDistance){
                return true;
            }else{ return false;}
         });
        return artLocations.id[indexSmallestDistance] ;
       }


}
    

const artLocations = {
    locations: [[2 , 1], [8 , 8], [10,2],[0,10]],
    id: [1234, 5678, 5679, 8907]
}

const currentLocation = [0,0];




// console.log(route.closestArt(currentLocation, artLocations));

export default route;