var Cell = require("lib/cell");
var Room = require("lib/room");

function DungeonLayout(columns, rows, room_templates) {
  this.rows = rows;
  this.columns = columns;
  this.visitedCells = [];
  this.cells = null;
  this.room_templates = room_templates;
  this.padding = 4;
  this.cells = new Array(rows);
  for(var c = 0; c < this.cells.length; c++) {
    this.cells[c] = new Array(rows);
  }
  console.log("Preparing to create new area...");
}

DungeonLayout.prototype.clear = function() {
  for (var y = 0; y < this.rows; y++) {
    for (var x = 0; x < this.columns; x++) {
      var cell = new Cell.Base();
      this.cells[y][x] = cell;
    }
  }
}

DungeonLayout.prototype.debug = function(id) {
  var div = $(id);
  $(id).empty();
  
  for (var y = 0; y < this.cells.length; y++) {
    for (var x = 0; x < this.cells[y].length; x++) {
      var block = $('<div class="t"><span>'+x+':'+y+'</span></div>');
      var c = this.cells[y][x];
      if(c.isDoor() || c.isWall()) { 
        block.addClass("W");
      } else if (c.isFloor()) {
        block.addClass("f");
      }
      
      if (c.tested) {
        block.addClass("tested");
      }
      $(id).append(block);

    }
    $(id).append("<div class='clear'></div>");
  }
}

DungeonLayout.prototype.make = function() {
  this.generate();
  var areas = [];
  while (area = this.nextArea()) {
    console.log("New not connected area detected! Cells: "+area.length);
    areas.push(area);
  }
  
  //this.refillUnusedSpace();
  //this.surround_every_floor_with_wall();
}

DungeonLayout.prototype.generate = function() {
  var tallest_height, widest_width, y, room_exits;
  var self = this;
  this.cells = [];

  // tallest room's height and widest rooms width?
  tallest_height = $.map(this.room_templates, function(rt) { return rt.height; } ).max();
  widest_width = $.map(this.room_templates, function(rt) { return rt.width; } ).max();

  y = 0;
  room_exits = [];

  // loop until our rows run out
  while( y < this.rows) {
    var rooms, room_for_x, a_room, row_tallest_height, gaps, num_unused_spaces, x;
    
    // pick soself rooms
    rooms = [];
    room_for_x = this.columns;
    
    while( room_for_x > widest_width ) {
      a_room = this.room_templates[Math.floor(Math.random() * this.room_templates.length)];
      rooms.push(a_room.clone());
      room_for_x -= (a_room.width + 1);
    }

    // tallest height just for this row
    row_tallest_height = $.map(rooms, function(r) { return r.height; } ).max();

    // 0 spaces on each end, at least 3 spaces in between each room
    arr = new Array(rooms.length - 1);
    $.each(arr, function(i, v) { arr[i] = self.padding; });
    gaps = [0].concat(arr).concat([0]); 
    
    num_unused_spaces = this.columns - (self.padding * rooms.length + $.map(rooms, function(r) { return r.width; }).sum());

    // randomly distribute extra spaces into gaps
    for(i=0; i < num_unused_spaces; i++) {
      gaps[Math.floor(Math.random() * gaps.length)] += 1;
    }

    for(n=y; n < (y + tallest_height); n++) {
      arr = new Array(this.columns);
      $.each(arr, function(i, v) { 
        var cell = new Cell.Base();
        arr[i] = cell; 
      });
      this.cells[n] = arr;
    }

    // shift ahead past first gap
    x = gaps[0];
    self = this;
    // cycle through rooms and populate cells
    $.each(rooms, function(index, room) { 
      var extra_y_offset = Math.floor(Math.random() * (row_tallest_height - room.height));
      $.each(room.cells, function(y_in_room, room_y_row) { 
        $.each(room_y_row, function(x_in_room, room_value) {
          self.cells[y + y_in_room + extra_y_offset][x + x_in_room] = room_value.clone();
        });
      });

      // collect the exit points, offset for x, y
      $.each(room.exits(), function(i, e) {
        room_exits = room_exits.concat([[e[0]+x, e[1]+y+extra_y_offset]]);
      });
      
      // shift past this room and then next gap
      x += room.width + gaps[index+1];
    });

    y += tallest_height;
    if( y < this.rows ) {
      for(n=y; n <= (y + self.padding); n++) {
        arr = new Array(this.columns);
        $.each(arr, function(i, v) { 
          var cell = new Cell.Base();
          arr[i] = cell; 
        });
        this.cells[n] = arr;
      }
      y += self.padding;
    }

    // shift y up to one spot past what we have now, for the while loop
    y = this.cells.length;
  } // end while loop through room rows
  
  // collect exit pairs - get the actual stub that sticks out from an exit if one exists
  var usable_room_exit_pairs = [];
  var self = this;
  
  $.each(room_exits, function(exit_index, exit) {
    var _wef = self.wheres_empty_from(exit[0],exit[1]);
    if(_wef) usable_room_exit_pairs.push([exit, _wef]);
  });
  
  // randomly sort the exit pairs
  usable_room_exit_pairs.sort( function() { return 0.5 - Math.random(); } );

  var used_exits = [];
  
  // now draw corridors by looping through all possible links between exits
  $.each(usable_room_exit_pairs, function(exit_index, exit_pair) {
    var other_exit_pairs = usable_room_exit_pairs.slice();
    other_exit_pairs.splice(exit_index, 1);
    $.each(other_exit_pairs, function(other_exit_index, other_pair) {
      var other_orig = other_pair[0];
      var other_outer_exit = other_pair[1];
      var this_orig = exit_pair[0];
      var outer_exit = exit_pair[1];
      if( self.is_clear_from_to(outer_exit[0], outer_exit[1], other_outer_exit[0], other_outer_exit[1]) ) {
        self.draw_corridor_from_to(outer_exit[0], outer_exit[1], other_outer_exit[0], other_outer_exit[1])
        self.cells[this_orig[1]][this_orig[0]].type = Cell.Type.Floor
        self.cells[other_orig[1]][other_orig[0]].type = Cell.Type.Floor
        used_exits.push(this_orig);
        used_exits.push(other_orig);
      }
    });
  });

}

DungeonLayout.prototype.refillUnusedSpace = function() {
  var pad = Math.round(this.padding / 2);
  this.rows = this.cells.length + this.padding;
  this.columns = $.map(this.cells, function(row) { return row.length; } ).max() + this.padding;
  for (var t = 0; t < pad; t++) {
    this.cells.splice(0, 0,new Array(this.columns));
  }
  for (var y = 0; y < this.rows; y++) {
    if(this.cells[y] == undefined){
      this.cells[y] = new Array(this.columns);
    }
    for (var t = 0; t < pad; t++) {
      this.cells[y].splice(0, 0, new Cell.Base());
    }
    for (var x = 0; x < this.columns + pad; x++) {
      if (this.cells[y][x] == undefined){
        var cell = new Cell.Base();
        this.cells[y][x] = cell;
      }
    }
  }
  
  //this.rows = this.rows + pad;
  //this.columns = this.columns + pad;
}

DungeonLayout.prototype.countCellOfType = function(type) {
  var count = 0;
  for (var y = 0; y < this.cells.length; y++) {
    for (var x = 0; x < this.cells[y].length; x++) {
      if (this.cells[y][x] && this.cells[y][x].type == type){
        count += 1;
      }
    }
  }
  
  return count;
}

DungeonLayout.prototype.firstCell = function(callback) {
  for (var y = 0; y < this.cells.length; y++) {
    for (var x = 0; x < this.cells[y].length; x++) {
      if (this.cells[y][x] && callback(this.cells[y][x]) ){
        return [x,y];
      }
    }
  }
  
  return false;
}

DungeonLayout.prototype.nextArea = function() {
  var startPos = this.firstCell(function(cell){ return (cell.type == Cell.Type.Floor && cell.tested == false); });
  if (!startPos || this.cells.length == 0) {
    return false;
  }
  
  var cellStack = [startPos];
  var areaCells = [];
  var testedCount = 0;
  
  while(cellStack.length > 0) {
    var pos = cellStack.pop();
    var x = pos[0];
    var y = pos[1];
    var cell = this.cells[y][x];
    if (cell && cell.tested == false) {
      cell.tested = true;
      areaCells.push(pos);
      testedCount += 1;

      // add upper cell
      var uy = y-1;
      if (uy >= 0 && uy < this.cells.length && this.cells[uy][x] && !this.cells[uy][x].tested && this.cells[uy][x].isFloor()) {
        cellStack.push([x,uy]);
      }

      // add lower cell
      var dy = y+1;
      if (dy < this.cells.length && this.cells[dy][x] && !this.cells[dy][x].tested && this.cells[dy][x].isFloor()) {
        cellStack.push([x,dy]);
      }
      
      // add left cell
      var lx = x - 1;
      if (lx >= 0 && lx < this.cells[y].length && !this.cells[y][lx].tested && this.cells[y][lx].isFloor()) {
        cellStack.push([lx,y]);
      }
      
      // add right cell
      var rx = x + 1;
      //console.log(rx);
      if (rx >= 0 && rx < this.cells[y].length && !this.cells[y][rx].tested && this.cells[y][rx].isFloor()) {
        cellStack.push([rx,y]);
      }
      
    }
  }
  //var totalCells = this.countCellOfType(Cell.Type.Floor);
  //console.log("Total Cells " + totalCells + " vs Filled Cells: "+ testedCount);
  return areaCells.length > 0 ? areaCells : false;
}

// actually picks the random points for the corridor given the start and end and modifies the 2D array
DungeonLayout.prototype.draw_corridor_from_to = function(x1, y1, x2, y2) {
  var h_mod, v_mod, x, y;
  h_mod = x1 < x2 ? 1 : -1;
  v_mod = y1 < y2 ? 1 : -1;
  x = x1;
  y = y1;

  while( x !== x2 || y !== y2) {
    this.cells[y][x].type = Cell.Type.Floor;

    if(x != x2 && Math.random() > 0.5) {
      x += h_mod;
    } else if(y != y2) {
      y += v_mod;
    }
  }

  this.cells[y][x].type = Cell.Type.Floor;
}

/* utility functions to assist with mapping */

DungeonLayout.prototype.wheres_empty_from = function(x,y) {
  if(this.north_from(x,y) && this.north_from(x,y).isEmpty()) return [x,   y-1];
  if(this.south_from(x,y) && this.south_from(x,y).isEmpty()) return [x,   y+1];
  if(this.west_from(x,y) && this.west_from(x,y).isEmpty()) return [x-1, y  ];
  if(this.east_from(x,y) && this.east_from(x,y).isEmpty()) return [x+1, y  ];
  return false;
}

DungeonLayout.prototype.north_from = function(x,y) { return (y > 0 ? this.cells[y-1][x] : null); }

DungeonLayout.prototype.south_from = function(x,y) { return (y < (this.cells.length-1) ? this.cells[y+1][x] : null); }

DungeonLayout.prototype.west_from = function(x,y) { return (x > 0 ? this.cells[y][x-1] : null); }

DungeonLayout.prototype.east_from = function(x,y) { return (x < (this.cells[0].length-1) ? this.cells[y][x+1] : null); }

DungeonLayout.prototype.northeast_from = function(x,y) { return ((y > 0 && x > 0) ? this.cells[y-1][x+1] : null); }

DungeonLayout.prototype.southeast_from = function(x,y) { return ((y > 0 && x > 0 && y + 1 < this.cells.length && x + 1 < this.cells[y].length) ? this.cells[y+1][x+1] : null); }

DungeonLayout.prototype.northwest_from = function(x,y) { return ((y > 0 && x > 0) ? this.cells[y-1][x-1] : null); }

DungeonLayout.prototype.southwest_from = function(x,y) { return ((y > 0 && x > 0 && y + 1 < this.cells.length && x + 1 < this.cells[y].length) ? this.cells[y+1][x+1] : null); }

// returns true only if you have a rectangle of empty spaces between the two points given
DungeonLayout.prototype.is_clear_from_to = function(x1, y1, x2, y2) {
  start_x = [x1,x2].min();
  end_x = [x1,x2].max();
  start_y = [y1,y2].min();
  end_y = [y1,y2].max();
  for(y=start_y; y <= end_y; y++) {
    for(x=start_x; x <= end_x; x++) {
      if(this.cells[y][x] != null && !this.cells[y][x].isEmpty()) return false;
    }
  }
  return true;
}

// makes sure there are walls where appropriate - do after drawing corridors
DungeonLayout.prototype.surround_every_floor_with_wall = function() {
  var self = this;
  $.each(this.cells, function(y, y_row) {
    $.each(y_row, function(x, tile) {
      if(tile && tile.isFloor()) {
        if(self.north_from(x,y) && self.north_from(x,y).isEmpty())     self.cells[y-1][x  ].type = Cell.Type.Wall;
        if(self.south_from(x,y) && self.south_from(x,y).isEmpty())     self.cells[y+1][x  ].type = Cell.Type.Wall;
        if(self.west_from(x,y) && self.west_from(x,y).isEmpty())      self.cells[y  ][x-1].type = Cell.Type.Wall;
        if(self.east_from(x,y) && self.east_from(x,y).isEmpty())      self.cells[y  ][x+1].type = Cell.Type.Wall;
        if(self.northeast_from(x,y) && self.northeast_from(x,y).isEmpty()) self.cells[y-1][x+1].type = Cell.Type.Wall;
        if(self.southeast_from(x,y) && self.southeast_from(x,y).isEmpty()) self.cells[y+1][x+1].type = Cell.Type.Wall;
        if(self.northwest_from(x,y) && self.northwest_from(x,y).isEmpty()) self.cells[y-1][x-1].type = Cell.Type.Wall;
        if(self.southwest_from(x,y) && self.southwest_from(x,y).isEmpty()) self.cells[y+1][x-1].type = Cell.Type.Wall;
      } else if(tile && tile.isDoor()) {
        self.cells[y][x].type = Cell.Type.Wall;
      }
    });
  });
}

exports.Base = DungeonLayout;

