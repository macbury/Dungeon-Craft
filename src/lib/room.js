require("lib/utils");
var Cell = require("lib/cell");

function Room(content) {
  this.cells = [];
  this.height = null;
  this.width = null;
  
  var self, rows, long_x;
    
  rows = content.split('\n');
  self = this;
  $.each(rows, function(y, row) {
    self.cells[y] = [];
    $.each(row, function(x, letter) {
      var cell = new Cell.Base();
      cell.type = Cell.Type.toCellType(letter);
      self.cells[y].push(cell);
    });
  });

  long_x = $.map(self.cells, function(r) { return r.length; } ).max();

  $.each(self.cells, function(y, y_row) {
    while(self.cells[y].length < long_x) {
      var cell = new Cell.Base();
      self.cells[y].push(cell);
    }
  });
  
  this.height = this.cells.length;
  this.width = this.cells[0].length; 
}

Room.prototype.exits = function() {
  var tiles = [];
  
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var cell = this.cells[y][x];
      if (cell.isDoor()) {
        tiles.push([x,y]);
      }
    }
  }
  return tiles;
}

Room.prototype.clone = function() {
  return jQuery.extend(true, {}, this);
}

exports.Base = Room;
