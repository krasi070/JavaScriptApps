const baseUrl = 'https://baas.kinvey.com/appdata';
const appId = 'kid_BJXTsSi-e';
const username = 'guest';
const password = 'guest';
const headers = {
    Authorization: 'Basic ' + btoa(username + ':' + password)
};

let currMessage = 'Knock Knock.';

function knock() {
    let getAnswerRequest = {
        method: 'GET',
        url: `${baseUrl}/${appId}/knock?query=${currMessage}`,
        headers: headers
    };

    $.ajax(getAnswerRequest)
        .then(displayAnswer)
        .catch(displayError)
}

function displayAnswer(data) {
    currMessage = data.message;
    $('#answer').text(data.answer);
    if (data.message) {
        $('#next-msg').text(data.message);
    } else {
        $('#next-msg').text('[Secret Knock Done]');
        $('#btnKnock').attr('disabled', true);
    }
}

function displayError(error) {
    $(document.body)
        .append($('<div>')
            .text(`Error: ${error.status} (${error.statusText})`));
}