var Direction = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
  
  Horizontal: 5,
  Vertical: 6,
  
  negative: function(direction) {
    if (Direction.Up == direction) {
      direction = Direction.Down;
    } else if (Direction.Down == direction) {
      direction = Direction.Up;
    } else if (Direction.Left == direction) {
      direction = Direction.Right;
    } else if (Direction.Right == direction) {
      direction = Direction.Left;
    }
  },
  
  randomVH: function() {
    return Math.round(Math.random()*6) % 2 == 0 ? Direction.Horizontal : Direction.Vertical;
  },
  
  random: function() {
    return Math.round(Math.random()*3);
  }
};

function DirectionPicker() {
  this.list = [];
}

DirectionPicker.prototype.hasNextDirection = function() {
  return (this.list.length < 4)
}

DirectionPicker.prototype.getNextDirection = function() {
  if (!this.hasNextDirection()){
    console.log("No directions available");
    return false;
  }
  
  var directionPicked = Direction.random();

  while(this.list.contains(directionPicked)) {
    directionPicked = Direction.random();
  }
  
  this.list.push(directionPicked);
  
  return directionPicked;
}

exports.Direction = Direction;
exports.DirectionPicker = DirectionPicker;
