// classes
var Battleship = function(length, orientation = "horizontal")
{
	this.orientation = orientation;
	this.length = length;
}

var Player = function(human)
{
	this.human = human;
}

var Board = function(location, owner="mine")
{
	this.board = [];
	this.waters = {};
	this.spreadSeas = function()
	{
  		var mySeas = document.createElement("table");
  		for(var i = 0; i < 10; i++)
  		{
  			this.board.push(new Array());
  			var seaLine = document.createElement("tr");
  			for(var j = 0; j < 10; j++)
  			{
  				myWater = document.createElement("td");
  				myWater.setAttribute("class", owner);
  				this.board[i][j] = 0;
  				this.waters[String(i) + String(j)] = myWater;
  				seaLine.appendChild(myWater);
  			}
  			mySeas.appendChild(seaLine);
  		}
  		location.appendChild(mySeas);
	}

	this.deployShip = function(size)
	{
		var undeployed = true;
		while (undeployed)
		{
			var orientation = Math.floor(Math.random() * 10 + 1);
			var y = Math.floor(Math.random() * 10);
			var x = Math.floor(Math.random() * 10);
			var legal = this.checkLegality(x, y, size, orientation);
			if (legal)
			{
				for(var i = 0; i < size; i++)
				{
					if(orientation > 5) // vertical
					{
						this.board[y + i][x] = 1;
					}
					else // horizontal
					{
						this.board[y][x + i] = 1;
					}
				}
				undeployed = false;
			}
			// re-roll
		}
	}

	this.checkLegality = function(x, y, size, orientation)
	{
		for(var i = 0; i < size; i++)
		{
			if(orientation > 5) // vertical
			{
				if(y + size > 10 || this.board[y + i][x] === 1)
				{
					return false;
				}
			}
			else // horizontal
			{
				if(x + size > 10 || this.board[y][x + i] === 1)
				{
					return false;
				}
			}
		}
		return true;
	}

	this.updateWater = function(coordinate)
	{
		if(this.board[coordinate[0]][coordinate[1]] === 1 && this.waters[coordinate].className == "mine")
		{
			this.waters[coordinate].style.backgroundColor = "lime";
		}
		
	}

	this.updateSea = function()
	{
		for(var i = 0; i < 10; i++)
		{
			for(var j = 0; j < 10; j++)
			{
				this.updateWater(String(i) + String(j));
			}
		}
	}

	this.deployShips = function()
	{
		for(var i = 2; i < 6; i++)
		{
			this.deployShip(i);
		}
		this.deployShip(3);
		this.updateSea();
	}
}

var Game = function()
{
	this.myDiv = document.createElement("div");
	this.enemyDiv = document.createElement("div");
	this.messageBoard = document.createElement("div");
	this.arena = document.createElement("div");
	this.mySeas = new Board(this.myDiv);
	this.enemySea = new Board(this.enemyDiv, "enemy");
	this.gameSetup = function()
	{
		this.arena.appendChild(this.myDiv);
		this.arena.appendChild(this.messageBoard);
		this.messageBoard.innerHTML = "Testing";
		this.arena.appendChild(this.enemyDiv);
		var body = $("body");
		body.append(this.arena);
		this.newGame();
	}
	this.newGame = function()
	{
		this.mySeas.spreadSeas();
  		this.mySeas.deployShips();
  		this.enemySea.spreadSeas();
  		this.enemySea.deployShips();
	}
}



$(function() {
  var game = new Game();
  game.gameSetup();
})