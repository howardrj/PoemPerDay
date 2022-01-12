// Maze class defintion
function Maze (numCellsX, numCellsY, bias, cellWidth)
{
    // Define default values
    this.numCellsX = typeof numCellsX !== 'undefined' ? numCellsX : 5; 
    this.numCellsY = typeof numCellsY !== 'undefined' ? numCellsY : 5; 
    this.bias      = typeof bias      !== 'undefined' ? bias      : 0.5; 
    this.cellWidth = typeof cellWidth !== 'undefined' ? cellWidth : 70; // Pixel dimensions of cell 
    this.debug             = false;
    this.generated         = false;
    this.regenerateRequest = false;
};

Maze.prototype.initializeGrid = function ()
{
    var maze_container = document.getElementById("maze_container");

    // Remove all children
    while (maze_container.hasChildNodes()) 
    {
        maze_container.removeChild(maze_container.lastChild);
    }

    var grid_height = this.cellWidth * this.numCellsY;
    var grid_width  = this.cellWidth * this.numCellsX;

    maze_container.style.height = grid_height.toString() + 'px'; 
    maze_container.style.width  = grid_width.toString()  + 'px'; 

    for (var i = 0; i < this.numCellsY; i++)
    {
        // Create cell row
        var cell_row = document.createElement("div");

        // Add class, height and width
        cell_row.classList.add("cell_row");
        cell_row.style.height = (this.cellWidth).toString() + 'px';
        cell_row.style.width  = maze_container.style.width;

        // Append to maze_container
        maze_container.appendChild(cell_row);

        for (var j = 0; j < this.numCellsX; j++)
        {
            // Create cell
            var cell = document.createElement("div");

            // Add class, height, width, line height and set id
            cell.classList.add("cell");
            cell.style.height      = (this.cellWidth).toString() + 'px';
            cell.style.width       = (this.cellWidth).toString() + 'px';
            cell.style.lineHeight  = (this.cellWidth).toString() + 'px';
            cell.innerHTML         = (this.debug) ? (i * this.numCellsX + j + 1).toString() : '<i class="fa fa-circle" aria-hidden="true"></i>';
            cell.style.fontSize    = (this.debug) ? "15px" : "8px";

            cell.setAttribute('set-id', (i * this.numCellsX + j + 1).toString());

            // If last cell in row, remove right border
            if (j == this.numCellsX - 1)
                cell.style.borderRight = "0px";

            // If cell is in last row, remove bottom border
            if (i == this.numCellsY - 1)
                cell.style.borderBottom = "0px";

            // Append to cell row
            cell_row.appendChild(cell);
        }
    }

    this.generated = false;
    
    if (this.regenerateRequest)
    {
        this.generateMaze(); // Tricky to put setTimeout here
        this.regenerateRequest = false;
    }
};

Maze.prototype.generateMaze = function ()
{
    // User wants to regenerate maze so set flag
    if (this.generated)
    {
        this.regenerateRequest = true;
        this.initializeGrid();
        return;
    }
    
    // Loop over each row except last
    var cell_rows = document.getElementsByClassName("cell_row");

    for (var i = 0; i < cell_rows.length - 1; i++)
    {
        // Get cells in this row
        var cells = cell_rows[i].getElementsByClassName("cell");

        // Get cells in next row
        var next_cells = cell_rows[i + 1].getElementsByClassName("cell");

        // Loop through all cells in row and randomly join disjoint sets
        for (var j = 0; j < cells.length - 1; j++)
        {
            if ((cells[j].getAttribute('set-id') != cells[j + 1].getAttribute('set-id')) && (Math.random() < this.bias))
            {
                cells[j].style.borderRightColor = "white";

                // Merge sets (adjust set-id of old cells as well as next one)
                // Ensures each row has correct set number configuration
                var cells_to_update = new Array();

                for (var k = 0; k < cells.length; k++)
                {
                    if (cells[k].getAttribute('set-id') == cells[j + 1].getAttribute('set-id'))
                        cells_to_update.push(k);
                }
                
                // Update cells at indices we captured in previous loop
                for (var k = 0; k < cells_to_update.length; k++)
                {
                    cells[cells_to_update[k]].setAttribute('set-id', cells[j].getAttribute('set-id'));

                    if (this.debug)
                        cells[cells_to_update[k]].innerHTML = cells[j].innerHTML;
                } 
            }
        }

        // Create map (key, value) = (set_id, array of indexes in set)
        var row_map = new Map();

        // Loop through row again and gather set info
        for (var j = 0; j < cells.length; j++)
        { 
            // Check if map has cell set id as key
            if (!row_map.has(cells[j].getAttribute('set-id')))
            {
                set_nodes_array = new Array();
                set_nodes_array.push(j);
                row_map.set(cells[j].getAttribute('set-id'), set_nodes_array);
            }
            else
            {
                row_map.get(cells[j].getAttribute('set-id')).push(j);
            }
        }

        var debug_mode = this.debug; // Can't access 'this' pointer inside forEach for some reason
        var bias_value = this.bias;

        // Loop through map info
        row_map.forEach(function (value, key, map) {

            // Check against bias if we should add a downlink for each cell in value
            // If none are added at the end, choose a random one    
            var downward_links_created = 0;

            for (var k = 0; k < value.length; k++)
            {
                // Include bias in here
                if (Math.random() > bias_value)
                {
                    cells[value[k]].style.borderBottomColor = "white";
                    next_cells[value[k]].setAttribute('set-id', cells[value[k]].getAttribute('set-id'));

                    if (debug_mode)
                        next_cells[value[k]].innerHTML = cells[value[k]].innerHTML;
                }
            }

            if (downward_links_created == 0)
            {
                var cell_index = value[Math.floor(Math.random() * value.length)]; 

                cells[cell_index].style.borderBottomColor = "white";
                next_cells[cell_index].setAttribute('set-id', cells[cell_index].getAttribute('set-id'));

                if (debug_mode)
                    next_cells[cell_index].innerHTML = cells[cell_index].innerHTML;
            }
        });
    }

    // Join up disjoint sets in last row
    var cells = cell_rows[this.numCellsY - 1].getElementsByClassName("cell");
        
    for (var j = 0; j < cells.length - 1; j++)
    {
        if (cells[j].getAttribute('set-id') != cells[j + 1].getAttribute('set-id'))
        {
            cells[j].style.borderRightColor = "white";

            var cells_to_update = new Array();

            for (var k = 0; k < cells.length; k++)
            {
                if (cells[k].getAttribute('set-id') == cells[j + 1].getAttribute('set-id'))
                    cells_to_update.push(k);
            }
            
            // Update cells at indices we captured in previous loop
            for (var k = 0; k < cells_to_update.length; k++)
            {
                cells[cells_to_update[k]].setAttribute('set-id', cells[j].getAttribute('set-id'));

                if (this.debug)
                    cells[cells_to_update[k]].innerHTML = cells[j].innerHTML;
            } 
        }
    }

    this.generated = true;
};

// Create dat.GUI
(function (){

    var maze = new Maze();

    maze.initializeGrid();

    var gui = new dat.GUI();

    // Add fields to gui
    gui.add(maze, 'numCellsX', 1, 20, 1);
    gui.add(maze, 'numCellsY', 1, 20, 1);
    gui.add(maze, 'bias',      0, 1, 0.1);
    gui.add(maze, 'cellWidth', 10, 100, 1);
    gui.add(maze, 'debug');

    // Add buttons 
    gui.add(maze, 'initializeGrid');
    gui.add(maze, 'generateMaze');

})();
