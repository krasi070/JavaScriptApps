function phoneBook() {
    const baseUrl = 'https://phonebook-nakov.firebaseio.com/phonebook';

    $('#btnLoad').on('click', loadPhoneBook);
    $('#btnCreate').on('click', createPhoneBookEntry);
    
    function loadPhoneBook() {
        $('#phonebook').empty();
        let request = {
            method: 'GET',
            url: baseUrl + '.json',
            success: showPhoneBookEntries,
            error: showError
        };

        $.ajax(request);
    }
    
    function createPhoneBookEntry() {
        let newEntry = {
            person: $('#person').val(),
            phone: $('#phone').val()
        };

        $('#person').val('');
        $('#phone').val('');

        let request = {
            method: 'POST',
            url: baseUrl + '.json',
            data: JSON.stringify(newEntry),
            success: loadPhoneBook,
            error: showError
        };

        $.ajax(request);
    }

    function showPhoneBookEntries(phoneBookEntries) {
        for (let entryId in phoneBookEntries) {
            $('#phonebook')
                .append($('<li>').text(phoneBookEntries[entryId].person + ': ' + phoneBookEntries[entryId].phone + ' ')
                    .append($('<button>[Delete]</button>').on('click', deleteEntry.bind(this, entryId))));
        }
    }

    function showError() {
        $('#phonebook').append($('<li>').text('ERROR'));
    }

    function deleteEntry(entryId) {
        let request = {
            method: 'DELETE',
            url: baseUrl + '/' + entryId + '.json',
            success: loadPhoneBook,
            error: showError
        };

        $.ajax(request);
    }
}