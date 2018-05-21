/*
 * Create a list that holds all of your cards
 */
 

let gameData = {
    moves: 0,
    stars: 3,
    gameDeckOuterHtml: null,
    openCards: [],
    matchedCards: 0,
    gameStartTime: null,
    minutesSpan: null,
    secondsSpan: null,
    intervalId: null,
    totalSeconds: 0,
    starListObj: null,
    moveCounterObj: null
};

/**
 * Shuffles the DOM elements representing the game cards and
 * replaces the old deck with the newly shuffled one.
 * Sets gameData.gameDeckOuterHtml.
 */
function shuffleCards() {
    let cards = []
    let deck = document.querySelector('.deck');
    if (gameData.gameDeckOuterHtml === null) {
        gameData.gameDeckOuterHtml = deck.outerHTML;
    }

    let iconList = deck.querySelectorAll('i');
    for (let node of iconList) {
        cards.push(Array.from(node.classList));
    }

    shuffle(cards);
    // https://stackoverflow.com/questions/41774889/javascript-copy-node-to-documentfragment
    let docFrag = document.createRange().createContextualFragment(gameData.gameDeckOuterHtml);
    let dfNodes = docFrag.querySelectorAll('i');
    for (let i = 0; i < cards.length; i++) {
        dfNodes[i].className = cards[i].join(" ");
    }
    let container = document.querySelector('.container');
    container.removeChild(deck);
    container.appendChild(docFrag);
}

/**
 * Initializes the game by resetting all the variables in gameData back to their default values
 * and shuffles the cards on the screen.
 */
function initialize() {
    // Note that we do not reset DOM elements in gameData as the ones we store do not change
    gameData.moves = 0;
    gameData.stars = 3;
    gameData.openCards = [];
    gameData.matchedCards = 0;
    gameData.gameStartTime = null;
    gameData.intervalId = null;
    gameData.totalSeconds = 0;
    shuffleCards();
}

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
/**
 * Uses a Fisher-Yates shuffle on a given array.
 * @param {Array} array 
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    // return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */


/**
 * Event handler for a user clicking a card.
 * Handles showing new cards, matching good and bad pairs, updates the score panel/timer, and
 * displays the modal window if the user wins.
 */
function cardClick() {
    $('.deck').on('click', '.card', function() {
        // Handle timer - Game starts when the first card is clicked
        if (gameData.gameStartTime === null) {
            startGameTime();
            gameData.intervalId = setInterval(updateTime, 1000);
        }
        let clickedCard = $(this);
        // If we've already clicked on this card or it's been matched then ignore click
        if (clickedCard.hasClass('match') || clickedCard.hasClass('open')) {
            return;
        }
        else {
            if (gameData.openCards.length > 0) {
                // check to see if it's a matching card
                if (this.children[0].classList[1] === gameData.openCards[0].children[0].classList[1]) {
                    addMatchedPair(gameData.openCards[0], this);
                }
                else {
                    toggleSymbol(gameData.openCards[0]);
                    toggleBadMatch(gameData.openCards[0], this);
                    let timeoutId = setTimeout(toggleBadMatch, 1500, gameData.openCards[0], this);
                }
                // Clear open cards for next pair of selections
                gameData.openCards = []
                // Increment move counter and update it on the page
                gameData.moves++;
                // Update the moves counter and check the move counter to update the stars
                // This part must come after gameData.moves is incremented to work appropriately
                updateMovesCounter();
                updateStarList();
                // Check to see if we're at 16 matched cards (so add 2 every time there's a successful match) and if we're at 16 end the game
                if (gameData.matchedCards === 16) {
                    displayWinModal();
                }
            }
            else {
                // Simply show the card since this is the first one of a pair to be revealed
                toggleSymbol(this);
                gameData.openCards.push(this);
                gameData.moves++;
                // This part must come after gameData.moves is incremented to work appropriately
                updateMovesCounter();
                updateStarList();
            }
        }
    });
}

/**
 * Sets up event listeners on the restart button and the play again button in the modal window,
 * to allow users to restart the game.
 */
function restartGameEvent() {
    $('.score-panel').on('click', '.fa-repeat', function () {
        restartGame();
    });

    $('#win-modal').on('click', '#modal-button', function() {
        let modal = document.getElementById('win-modal');
        // Hide the modal pop-up
        $(modal).toggleClass('modal-hide modal-show');
        restartGame();
    });
}

/**
 * Handles restarting the game by resetting gameData and the UI elements.
 */
function restartGame() {
    clearInterval(gameData.intervalId);
    initialize();
    updateMovesCounter();
    updateTime();
    resetStarList();
    // Re-add event listener since new DOM object is created for the newly shuffled deck
    cardClick();
}

/**
 * Toggles the appropriate classes on a game card to show the icon to the user
 * @param {HTMLElement} cardObject The card the user clicked on
 */
function toggleSymbol(cardObject) {
    $(cardObject).toggleClass('open show animated flipInY');
}

/**
 * Toggles the appropriate classes to animate and display a matched pair of cards
 * @param {HTMLElement} firstCardObject The first card clicked in the pair of cards
 * @param {HTMLElement} secondCardObject The second matching card clicked
 */
function addMatchedPair(firstCardObject, secondCardObject) {
    toggleSymbol(firstCardObject);
    $(firstCardObject).toggleClass('match animated bounce');
    $(secondCardObject).toggleClass('match animated bounce');
    gameData.matchedCards += 2;
}

/**
 * Toggles the appropriate classes to animate and dispaly a bad match pair of cards
 * @param {HTMLElement} firstCardObject The first card clicked in the pair of cards
 * @param {HTMLElement} secondCardObject The second card clicked
 */
function toggleBadMatch(firstCardObject, secondCardObject) {
    $(firstCardObject).toggleClass('open show bad-match animated shake');
    $(secondCardObject).toggleClass('open show bad-match animated shake');
}

/**
 * Sets the start time for the game (i.e., when the player clicks the first card)
 */
function startGameTime() {
    gameData.gameStartTime = Date.now();
}

/**
 * Sets the UI elements that handle the game timer
 * Some code used from this post: https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
 */
function updateTime() {
    if (gameData.minutesSpan === null || gameData.secondsSpan === null) {
        gameData.minutesSpan = document.getElementById('minutes');
        gameData.secondsSpan = document.getElementById('seconds');
    }
    if (gameData.gameStartTime != null) {
        gameData.totalSeconds = Math.floor((Date.now() - gameData.gameStartTime) / 1000);
    }
    gameData.secondsSpan.innerHTML = padTimeString(gameData.totalSeconds % 60);
    gameData.minutesSpan.innerHTML = padTimeString(parseInt(gameData.totalSeconds / 60));
}

/**
 * Sets the UI elements that handle the move counter
 */
function updateMovesCounter() {
    if (gameData.moveCounterObj === null) {
        gameData.moveCounterObj = document.getElementsByClassName('moves')[0];
    }
    gameData.moveCounterObj.innerHTML = gameData.moves;
}

/**
 * Removes stars from the score panel while the player is playing the game.
 */
function updateStarList() {
    if (gameData.stars > 1) {
        if (gameData.moves === 24 || gameData.moves === 34) {
            removeOneStar();
        }
    }
}

/**
 * Removes one star icon from the score panel.
 */
function removeOneStar() {
    if (gameData.starListObj === null) {
        gameData.starListObj = document.getElementsByClassName('stars')[0];
    }
    gameData.stars--;
    $(gameData.starListObj.children[gameData.stars].children[0]).toggleClass('fa-star fa-star-o');
}

/**
 * Resets the stars on the score panel to have three full stars again.
 */
function resetStarList() {
    if (gameData.starListObj === null) {
        gameData.starListObj = document.getElementsByClassName('stars')[0];
    }
    for (let node of gameData.starListObj.children) {
        node.children[0].className = 'fa fa-star';
    }
}

/**
 * Takes a time in seconds or minutes and pads it to the appropriate length for display
 * Code used from this post: https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
 * @param {number} val 
 */
function padTimeString(val) {
    let valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
}

/**
 * Handles the display of the modal window and the contents within it
 */
function displayWinModal() {
    clearInterval(gameData.intervalId);
                    
    // Display time
    let modalMin = document.getElementById('modal-min');
    let modalSec = document.getElementById('modal-sec');
    modalMin.innerHTML = document.getElementById('minutes').innerHTML;
    modalSec.innerHTML = document.getElementById('seconds').innerHTML;
    
    // Display moves and stars
    let modalMoves = document.getElementById('modal-moves');
    let modalStars = document.getElementById('modal-stars');
    modalMoves.innerHTML = gameData.moves;
    if (gameData.stars === 1) {
        modalStars.innerHTML = gameData.stars.toString() + " star";    
    }
    else {
        modalStars.innerHTML = gameData.stars.toString() + " stars";
    }
    
    // show modal for the end of the game
    let modal = document.getElementById('win-modal');
    $(modal).toggleClass('modal-hide modal-show');
}

// Initialize the game when the DOM is ready
$(document).ready( function() {
    initialize();
    cardClick();
    restartGameEvent();
});