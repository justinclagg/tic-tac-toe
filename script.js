/*eslint-env browser, jquery */
$(document).ready(function () {
	"use strict";

	var userSymbol = "X",
		compSymbol = "O",
		difficulty = "Easy",
		board =  Array(9).fill(null),
		boardLen = board.length,
		status = "running",
		depth = 100,
		winningLine = [];
	
	// Symbol changes
	$(".symbol-buttons > button").click(function changeSymbol() {
		var tempSymbol = compSymbol;
		compSymbol = userSymbol;
		userSymbol = tempSymbol;
		$(this).addClass("active");
		$(this).siblings().removeClass("active");
	});

	// Difficulty changes
	$(".difficulty-buttons > button").click(function changeDifficulty() {
		difficulty = $(this).text();
		$(this).addClass("active");
		$(this).siblings().removeClass("active");
	});

	// User move
	$(".square").click(function userMove() {
		if (status === "running" && $(this).html() === "") {
			var squareIndex = $(this).attr("id").slice(7);
			board[squareIndex] = false;
			$(this).html(userSymbol);
			if (gameOver(board) === false) {
				compMove();
			}
		}
	});

	function gameOver(node) {
		var terminalStatus = checkTerminal(node);
		switch(terminalStatus) {
		case null:
			return false;
		case "User":
			win("User");
			status = "off";
			return true;
		case "Computer":
			win("Computer");
			status = "off";
			return true;
		case "Tie":
			status = "off";
			setTimeout(newGame, 1500);
			return true;
		}
	}

	function updateBoard() {
		for (var i = 0; i < boardLen; i++) {
			if (board[i] === true) {
				$("#square-" + i).text(compSymbol);
			}
			else if (board[i] === false) {
				$("#square-" + i).text(userSymbol);
			}
		}
	}

	function compMove() {
		var nextVal, bestVal, bestChild, children;
		bestVal = -1000;
		children = getChildNodes(board, true);
		children.forEach(function getMove(child) {
			nextVal = minimax(child, depth, false);	// false because it is the user's turn
			if (nextVal > bestVal) {
				bestVal = nextVal;
				bestChild = child;
			}
		});
		if (difficulty === "Easy") {
			if (Math.random() < 0.50) {
				board = bestChild;
			}
			else {
				board = children[Math.floor(Math.random() * children.length)];
			}
		}
		else if (difficulty === "Medium") {
			if (Math.random() < 0.90) {
				board = bestChild;
			}
			else {
				board = children[Math.floor(Math.random() * children.length)];
			}
		}
		else if (difficulty === "Hard") {
			board = bestChild;
		}
		updateBoard();
		gameOver(board);
	}
  
	function checkTerminal(node) {
		// Check diagonals for win
		if (node[0] !== null && node[0] === node[4] && node[4] === node[8]) {
			winningLine = [0, 4, 8];
			return node[0] === true ? "Computer" : "User";
		}
		else if (node[2] !== null && node[2] === node[4] && node[4] === node[6]) {
			winningLine = [2, 4, 6];
			return node[2] === true ? "Computer" : "User";
		}
		// Check rows for win
		for (var i = 0; i < 7; i += 3) {
			if (node[i] !== null && node[i] === node[i + 1] && node[i + 1] === node[i + 2]) {
				winningLine = [i, i + 1, i + 2];
				return node[i] === true ? "Computer" : "User";
			}
		}
		// Check columns for win
		for (var j = 0; j < 3; j++) {
			if (node[j] !== null && node[j] === node[j + 3] && node[j + 3] === node[j + 6]) {
				winningLine = [j, j + 3, j + 6];
				return node[j] === true ? "Computer" : "User";
			}
		}
		// Check for tie
		if (node.indexOf(null) === -1) {
			return "Tie";
		}
		// No terminal condition
		return null;
	}

	function minimax(node, depth, maximizingPlayer) {
		// Check if a leaf node has been reached
		var terminalNode = checkTerminal(node);
		if (depth === 0 || terminalNode !== null) {
			switch(terminalNode) {
			case "Computer":
				return 10 - (depth - depth);
			case "User":
				return -10 + (depth - depth);
			case "Tie":
				return 0;
			}
		}
		// Otherwise generate the children of node
		var bestVal, nextVal;
		var children = [];
		if (maximizingPlayer) {
			// Maximizing player (AI)
			bestVal = -1000;
			children = getChildNodes(node, true);
			children.forEach(function recursiveMinimax(child) {
				nextVal = minimax(child, depth - 1, false);
				bestVal = Math.max(bestVal, nextVal);
			});
			return bestVal;
		} else {
			// Minimizing player
			bestVal = 1000;
			children = getChildNodes(node, false);
			children.forEach(function recursiveMinimax(child) {
				nextVal = minimax(child, depth - 1, true);
				bestVal = Math.min(bestVal, nextVal);
			});
			return bestVal;
		}
	}

	function getChildNodes(node, maximizingPlayer) {
		var childrenArr = [],
			nodeCopy = [];
		for (var i = 0; i < boardLen; i++) {
			if (node[i] === null) {
				nodeCopy = node.slice();
				nodeCopy[i] = maximizingPlayer;
				childrenArr.push(nodeCopy);
			}
		}
		return childrenArr;
	}

	function win(player) {
		if (player === "User") {
			for (var i = 0; i < 3; i++) {
				$("#square-" + winningLine[i]).addClass("winning-square__user");
			}
		} else if (player === "Computer") {
			for (var j = 0; j < 3; j++) {
				$("#square-" + winningLine[j]).addClass("winning-square__comp");
			}
		}
		setTimeout(newGame, 1500, player);
	}

	function newGame(player) {
		if (player === "User") {
			for (var i = 0; i < 3; i++) {
				$("#square-" + winningLine[i]).removeClass("winning-square__user");
			}
		} else if (player === "Computer") {
			for (var j = 0; j < 3; j++) {
				$("#square-" + winningLine[j]).removeClass("winning-square__comp");
			}
		}
		for (var k = 0; k < 9; k++) {
			$("#square-" + k).html("");
		}
		board = Array(9).fill(null);
		status = "running";
	}

});