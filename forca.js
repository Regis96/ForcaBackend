var app = require('express')();
var http = require('http').Server(app);
var io = require('socket-io')(http);

const MAX_USERS = 10;
//nome, pronto e pontuação
var users = [];
var possibleLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'w', 'y', 'z'];
var usedLetters = [];
var word = [];
var tip;
var idAsker;
var joiningAllowed = true;

io.on('connection', manageClient);

function manageClient(client) {
    client.on('join', clientJoin);
    client.on('toggleReady', clientReady);
    client.on('chosenWord', clientChosenWord);
    client.on('pickLetter', clientPickLetter);
    client.on('guess', clientGuess);
    client.on('start', startRound);

}

//setar o asker em algum momento

function clientJoin(nome) {
    if (joiningAllowed) {
        var user = {
            nome: nome,
            pontos: 0,
            pronto: false
        }
        users[client.id] = user;
    }
}

function clientReady() {
    users[client.id].ready = !users[client.id].ready;
}

function clientChosenWord(chosenWord, tip) {
    if (client.id === idAsker) {
        for (var letter of chosenWord) {
            word.push({ letter: letter, guessed: false });
        }
        tip = tip;
        //pode dar problema
        client.emit('wordSaved');
        client.broadcast.emit('waitingPlayersReady');
    }
}

function clientPickLetter(letter) {
    if (!usedLetters.includes(letter)) {
        for (var currentletter of word) {
            if (currentLetter.letter === letter) {
                currentletter.guessed = true;
                break;
            }
        }
        client.emit('correcLetterUser');
        client.broadcast.emit('correctLetter', client.name);
    }
}

function clientGuess(guess) {
    var tempWord = '';
    for (var each of word) {
        tempWord += each.letter;
    }
    if (tempWord === guess) {
        client.emit('youWon');
        client.broadcast.emit('someoneWon', client.name);
        users[client.id].pontos += 1;
        startRound();
    } else {
        client.emit('clientLostUser');
        client.broadcast.emit('clientLost', client.name);
        //deleter usuario
        //impedir de outros usuarios entrarem denovo até o fim,mas permitir assistir
    }
}

function startRound() {
    usedLetters = [];
    word = [];
    tip = '';
    idAsker = null;

}

