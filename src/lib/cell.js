var CellType = {
  Empty: 0x00,
  Wall: 0x01,
  Floor: 0x02,
  Door: 0x03,
  
  toCellType: function(type_string) {
    if(type_string == "W") {
      return CellType.Wall;
    } else if(type_string.match(/f|P|I|M/) ) {
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
  this.item = false;
  this.monster = false;
  this.cid = 0;
  this.connected_with = null;
}

Cell.prototype.readProperties = function(type_string) {
  if(type_string == "P") {
    this.portal == true;
  }

  if(type_string == "I") {
    this.item == true;
  }

  if(type_string == "M") {
    this.monster == true;
  }
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
