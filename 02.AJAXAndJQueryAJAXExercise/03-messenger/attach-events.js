function attachEvents() {
    const baseUrl = 'https://messenger-81718.firebaseio.com/messenger';
    $('#refresh').on('click', refresh);
    $('#submit').on('click', send);

    function refresh() {
        $('#messages').val('');
        let request = {
            method: 'GET',
            url: baseUrl + '.json',
            success: displayMessages,
            error: displayError
        };

        $.ajax(request);
    }
    
    function send() {
        let author = $('#author').val();
        $('#author').val('');
        let content = $('#content').val();
        $('#content').val('');
        let timestamp = Date.now();
        let message = {
            author,
            content,
            timestamp
        };

        let request = {
            method: 'POST',
            url: baseUrl + '.json',
            data: JSON.stringify(message),
            success: refresh,
            error: displayError
        };

        $.ajax(request);
    }

    function displayMessages(messages) {
        let messagesKeys = [...Object.keys(messages)].sort((a, b) => messages[a].timestamp - messages[b].timestamp);
        for (let messageId of messagesKeys) {
            $('#messages').val($('#messages').val() + `${messages[messageId].author}: ${messages[messageId].content}\n`);
            // $('#messages').text($('#messages').text() + `${messages[messageId].author}: ${messages[messageId].content}\n`);
            // Uncomment so that it works in judge
        }
    }

    function displayError() {
        $('#messages').val('ERROR');
    }
}