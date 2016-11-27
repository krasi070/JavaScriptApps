const baseUrl = 'https://baas.kinvey.com/appdata';
const appId = 'kid_rk44JCdzl';
const username = 'guest';
const password = 'guest';
const basicAuth = `Basic ${btoa(username + ':' + password)}`;

let currPlayer = undefined;

function attachEvents() {
    $('#addPlayer').on('click', addPlayer);
    $('#save').on('click', savePlayerStatus);
    $('#reload').on('click', reload);
}

function addPlayer() {
    let name = $('#addName').val().trim();
    $('#addName').val('');

    let data = {
        name,
        money: 500,
        bullets: 6
    };

    let addPlayerRequest = {
        method: 'POST',
        url: `${baseUrl}/${appId}/players`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(addPlayerRequest)
        .then(getPlayers)
        .catch(displayError);
}

function getPlayers() {
    let getPlayersRequest = {
        method: 'GET',
        url: `${baseUrl}/${appId}/players`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(getPlayersRequest)
        .then(displayPlayers)
        .catch(displayError);
}

function play(name, money, bullets, id) {
    $('#canvas').css('display', '');
    $('#save').css('display', '');
    $('#reload').css('display', '');
    currPlayer = {
        name,
        money,
        bullets,
        id
    };

    loadCanvas(currPlayer);
}

function savePlayerStatus() {
    let data = {
        name: currPlayer.name,
        money: currPlayer.money,
        bullets: currPlayer.bullets
    };
    
    let savePlayerStatusRequest = {
        method: 'PUT',
        url: `${baseUrl}/${appId}/players/${currPlayer.id}`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };
    
    $.ajax(savePlayerStatusRequest)
        .then(() => {
            closeGame();
            getPlayers();
        })
        .catch(displayError);
}

function reload() {
    currPlayer.money -= 60;
    currPlayer.bullets = 6;
}

function displayPlayers(players) {
    $('#players').empty();
    for (let player of players) {
        $('#players')
            .append($('<div class="player">')
                .attr('data-id', player._id)
                .append($('<div class="row">')
                    .append($('<label>')
                        .text('Name: '))
                    .append($('<label class="name">')
                        .text(player.name)))
                .append($('<div class="row">')
                    .append($('<label>')
                        .text('Money: '))
                    .append($('<label class="money">')
                        .text(player.money)))
                .append($('<div class="row">')
                    .append($('<label>')
                        .text('Bullets: '))
                    .append($('<label class="bullets">')
                        .text(player.bullets)))
                .append($('<button class="play">')
                    .text('Play')
                    .on('click', () => {
                        play(player.name, Number(player.money), Number(player.bullets), player._id);
                    }))
                .append($('<button class="delete">')
                    .text('Delete')
                    .on('click', () => {
                        deletePlayer(player._id);
                    })));
    }
}

function closeGame() {
    currPlayer = undefined;
    $('#canvas').css('display', 'none');
    $('#save').css('display', 'none');
    $('#reload').css('display', 'none');
    clearInterval($('#canvas').intervalId);
}

function deletePlayer(id) {
    let deletePlayerRequest = {
        method: 'DELETE',
        url: `${baseUrl}/${appId}/players/${id}`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(deletePlayerRequest)
        .then(getPlayers)
        .catch(displayError);
}

function displayError(error) {
    $(document.body).empty();
    $(document.body)
        .append($('<span>')
            .text(`Error: ${error.status} (${error.statusText})`));
}