var CellType = {
  Empty: 0x00,
  Wall: 0x01,
  Floor: 0x02,
  Door: 0x03,
  
  toCellType: function(type_string) {
    if(type_string == "W") {
      return CellType.Wall;
    } else if(type_string == "f" ) {
      return CellType.Floor;
    } else if(type_string == "+" ) {
      return CellType.Door;
    } else {
      return CellType.Empty;
    }
  }
};

function Cell() {
  this.type = CellType.Empty;
  this.tested = false;
  this.portal = false;
  this.cid = 0;
}

Cell.prototype.isDoor = function() {
  return this.type == CellType.Door;
}

Cell.prototype.isPortal = function() {
  return this.portal;
}

Cell.prototype.isEmpty = function() {
  return this.type == CellType.Empty;
}

Cell.prototype.isFloor = function() {
  return this.type == CellType.Floor;
}

Cell.prototype.isWall = function() {
  return this.type == CellType.Wall;
}

Cell.prototype.clone = function() {
  return jQuery.extend(true, {}, this);
}

exports.Base = Cell;
exports.Type = CellType;
