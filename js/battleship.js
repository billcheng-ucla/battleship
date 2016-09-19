var message = "Greetings! <br> <br> Click on a grid to search that tile for an opponent's ship. If the opponent's ship is there, the tile will turn red; the tile will turn light blue if not. After you attack, your opponent will randomly try to attack your ships. Both you and your opponent start with a carrier(size 5), a battleship(size 4), a carrier and destroyer(size 3 each), and a patrol boat (size 2). Your ships have been randomly set for you (Neopet Rules) and they will appear green until hit. The winner is the first to sink his opponent's ships. Good Luck! <br><br>"

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
	this.HP = 17;
	this.spreadSeas = function()
	{
  		var mySeas = document.createElement("table");
  		for(var i = 0; i < 10; i++)
  		{
  			this.board.push(new Array());
  			var seaLine = document.createElement("tr");
  			for(var j = 0; j < 10; j++)
  			{
  				var coordinate = String(i) + String(j);
  				myWater = document.createElement("td");
  				myWater.setAttribute("class", owner);
  				myWater.setAttribute("coordinate", coordinate);
  				this.board[i][j] = 0;
  				this.waters[coordinate] = myWater;
  				seaLine.appendChild(myWater);
  			}
  			mySeas.appendChild(seaLine);
  		}
  		//console.log(location.childNodes);
  		if(location.childNodes[0])
  		{
  			location.removeChild(location.childNodes[0]);
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
			this.waters[coordinate].style.backgroundColor = "lime"; // this will disable the hover pseudoclass for some reason
		}
		else if(this.board[coordinate[0]][coordinate[1]] === -1)
		{
			this.waters[coordinate].style.backgroundColor = "cyan";
		}
		else if(this.board[coordinate[0]][coordinate[1]] === 2)
		{
			this.waters[coordinate].style.backgroundColor = "red";
		}
		else
		{
			this.waters[coordinate].style.backgroundColor = "";
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
	this.restart = document.createElement("button");
	this.mySeas = new Board(this.myDiv);
	this.enemySea = new Board(this.enemyDiv, "enemy");
	this.gameSetup = function()
	{
		var neutralZone = document.createElement("div");
		neutralZone.appendChild(this.messageBoard);
		neutralZone.appendChild(this.restart);
		var battlefield = $(".row");
		battlefield.append(this.myDiv);
		battlefield.append(neutralZone);
		battlefield.append(this.enemyDiv);
		neutralZone.setAttribute("class", "columns two");
		this.myDiv.setAttribute("class", "columns five");
		this.enemyDiv.setAttribute("class", "columns five");
		this.messageBoard.innerHTML = message;
		this.messageBoard.setAttribute("class", "message");
		this.restart.innerHTML = "restart";
		this.restart.addEventListener("click", this.restartGame);
		this.restart.self = this;
		this.newGame();
	}

	this.restartGame = function(e)
	{
		var myself = e.target.self;
		myself.newGame();
	}
	this.newGame = function()
	{
		this.mySeas.spreadSeas();
  		this.mySeas.deployShips();
  		this.enemySea.spreadSeas();
  		this.enemySea.deployShips();
  		this.gameBegin();
	}
	this.playerAttack = function(e)
	{
		var attackCoordinate = e.target.getAttribute("coordinate");
		var myself = e.target.self;
		var search = myself.enemySea.board[attackCoordinate[0]][attackCoordinate[1]];
		if(search === 0)
		{
			myself.enemySea.board[attackCoordinate[0]][attackCoordinate[1]]--;
		}
		else // if search === 1
		{
			myself.enemySea.HP--;
			myself.enemySea.board[attackCoordinate[0]][attackCoordinate[1]]++;
		}
		e.target.removeEventListener("click", myself.playerAttack);
		myself.enemySea.updateWater(attackCoordinate);
		var winner = myself.checkForWin(myself.mySeas, myself.enemySea);
		if(winner)
		{
			myself.messageBoard.innerHTML = "Player Win!";
			myself.gameEnd();
		}
		else
		{
			myself.counterAttack();
		}
	}

	this.counterAttack = function()
	{
		var attacking = true;
		while(attacking)
		{
			var y = Math.floor(Math.random() * 10);
			var x = Math.floor(Math.random() * 10);
			var attackCoordinate = String(y) + String(x);
			var search = this.mySeas.board[attackCoordinate[0]][attackCoordinate[1]];
			if(search === 0)
			{
				this.mySeas.board[attackCoordinate[0]][attackCoordinate[1]]--;
				attacking = false;
			}
			else if(search === 1)
			{
				this.mySeas.HP--;
				this.mySeas.board[attackCoordinate[0]][attackCoordinate[1]]++;
				attacking = false;
			}
			this.mySeas.updateWater(attackCoordinate);
		}
		var enemyWinner = this.checkForWin(this.enemySea, this.mySeas);
		if(enemyWinner)
		{
			this.messageBoard.innerHTML = "AI Wins!";
			this.gameEnd();
		}
	}

	this.checkForWin = function(attacker, defender)
	{
		if(defender.HP === 0)
		{
			
			return true;
		}
		return false;
	}
	this.gameBegin = function()
	{
		for(var i = 0; i < 10; i++)
		{
			for(var j = 0; j < 10; j++)
			{
				enemyWater = this.enemySea.waters[String(i) + String(j)];
				enemyWater.addEventListener("click", this.playerAttack);
				enemyWater.self = this; // self is a little confusing
			}
		}
	}

	this.gameEnd = function()
	{
		for(var i = 0; i < 10; i++)
		{
			for(var j = 0; j < 10; j++)
			{
				enemyWater = this.enemySea.waters[String(i) + String(j)];
				enemyWater.removeEventListener("click", this.playerAttack);
				enemyWater.self = this; // self is a little confusing
			}
		}
	}
}



$(function() {
  var game = new Game();
  game.gameSetup();
})