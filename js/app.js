/*
 * Create a list that holds all of your cards
 */

let gameData = {
    moves: 0,
    stars: 3,
    openCards: [],
    matchedCards: 0
};

function shuffleCards() {
    let cards = []
    let deck = document.querySelector('.deck');
    let iconList = deck.querySelectorAll('i');
    // let cards = Array.from(iconList);
    for (let node of iconList) {
        cards.push(Array.from(node.classList));
    }
    shuffle(cards);
    // https://stackoverflow.com/questions/41774889/javascript-copy-node-to-documentfragment
    let docFrag = document.createRange().createContextualFragment(deck.outerHTML);
    let dfNodes = docFrag.querySelectorAll('i');
    for (let i = 0; i < cards.length; i++) {
        dfNodes[i].className = cards[i].join(" ");
        // Could use jQuery removeClass to remove all classes then use the loop below
        // for (let cls of cards[i]) {
        //     dfNodes[i].classList.add(cls);
        // }
    }
    let container = document.querySelector('.container');
    container.removeChild(deck);
    container.appendChild(docFrag);
}

function initialize() {
    gameData.moves = 0;
    gameData.stars = 3;
    gameData.openCards = [];
    gameData.matchedCards = 0;
    shuffleCards();
}

$(document).ready( function() {
    initialize();
    cardClick();
});

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
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
function cardClick() {
    $('.deck').on('click', '.card', function() {
        let clickedCard = $(this);
        if (clickedCard.hasClass('match') || clickedCard.hasClass('open')) {
            return;
        }
        else {
            if (gameData.openCards.length > 0) {
                // check to see if it's a matching card
                if (this.children[0].classList[1] === gameData.openCards[0].children[0].classList[1]) {
                    // If yes, then add match class and the match animation class
                    addMatchedPair(gameData.openCards[0], this);
                }
                else {
                    // If no, then add bad-match class and bad match animation class
                    // If it is a bad match use setTimeout with your code for adding the classes to get the red
                    // background from the CSS we're given to get the user to see it's a bad match
                    toggleSymbol(gameData.openCards[0]);
                    toggleBadMatch(gameData.openCards[0], this);
                    let timeoutId = setTimeout(toggleBadMatch, 1500, gameData.openCards[0], this);
                }
                // Clear open cards for next pair of selections
                gameData.openCards = []
                // Increment move counter and update it on the page
                gameData.moves++;

                // Check to see if we're at 16 matched cards (so add 2 every time there's a successful match) and if we're at 16 end the game
                if (gameData.matchedCards === 16) {
                    // show modal for the end of the game
                }
            }
            else {
                // Simply show the card since this is the first one of a pair to be revealed
                toggleSymbol(this);
                gameData.openCards.push(this);
            }
        }
    })
}

function toggleSymbol(cardObject) {
    $(cardObject).toggleClass('open show animated flipInY');
}

function addMatchedPair(firstCardObject, secondCardObject) {
    toggleSymbol(firstCardObject);
    $(firstCardObject).toggleClass('match animated bounce');
    $(secondCardObject).toggleClass('match animated bounce');
    gameData.matchedCards += 2;
}

function toggleBadMatch(firstCardObject, secondCardObject) {
    $(firstCardObject).toggleClass('open show bad-match animated shake');
    $(secondCardObject).toggleClass('open show bad-match animated shake');
}