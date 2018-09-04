var app = require('express')();
var http = require('http').Server(app);
var io = require('socket-io')(http);

const MAX_USERS = 10;
//nome, pronto e pontuação
var users = [];
var usedLetters = [];
var word = [];
var tip;
var idAsker;
var joiningAllowed = true;
var tries = 5;

io.on('connection', manageClient);

function manageClient(client) {
    client.on('join', clientJoin);
    client.on('toggleReady', clientReady);
    client.on('chooseWord', clientChooseWord);
    client.on('pickLetter', clientPickLetter);
    client.on('guess', clientGuess);
    client.on('start', startRound);
}

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
    for (var each of users) {
        if (!each.ready) {
            io.emit('notAllPlayersReady');
            return;
        }
    }
    io.emit('showStartButton');
}

function setAsker() {
    var idAsker = Math.round(1 + Math.random() * users.length);
    io.emit('askedChosen', users[idAsker]);
}

function clientChooseWord(chosenWord, tip) {
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
        var guessed = false;
        for (var currentletter of word) {
            if (currentLetter.letter === letter) {
                currentletter.guessed = true;
                gussed = true;
                break;
            }
        }
        if (guessed) {
            client.emit('correcLetterUser');
            client.broadcast.emit('correctLetter', client.name);
        } else {
            tries -= 1;
            if (tries > 0) {
                client.emit('wrongLetter', tries);
            } else {
                client.emit('endGame');
                resetRoundInfo();
            }
        }
    }
    usedLetters.push(letter);
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
        users[client.id].ready = false;
    }
}

function resetRoundInfo() {
    usedLetters = [];
    word = [];
    tip = '';
    idAsker = null;
    joiningAllowed = true;
    tries = 5;
    io.emit('newRoundReady');
}

function startRound() {
    joiningAllowed = false;
    io.emit('gameStart');
}

http.listen(3000);