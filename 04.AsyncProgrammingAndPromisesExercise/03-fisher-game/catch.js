function attachEvents() {
    const baseUrl = 'https://baas.kinvey.com/appdata';
    const appId = 'kid_ryRxpQUfx';
    const username = 'guest';
    const password = 'guest';
    const basicAuth = `Basic ${btoa(username + ':' + password)}`;
    const contentType = 'application/json';
    
    $('.load').on('click', loadCatches);
    $('.add').on('click', addCatch);
    
    function loadCatches() {
        let getCatchesRequest = {
            method: 'GET',
            url: `${baseUrl}/${appId}/biggestCatches`,
            headers: {
                Authorization: basicAuth
            }
        };

        $.ajax(getCatchesRequest)
            .then(displayCatches)
            .catch(displayError);
    }

    function addCatch() {
        let angler = $('#addForm .angler').val();
        $('#addForm .angler').val('');
        let weight = Number($('#addForm .weight').val());
        $('#addForm .weight').val('');
        let species = $('#addForm .species').val();
        $('#addForm .species').val('');
        let location = $('#addForm .location').val();
        $('#addForm .location').val('');
        let bait = $('#addForm .bait').val();
        $('#addForm .bait').val('');
        let captureTime = Number($('#addForm .captureTime').val());
        $('#addForm .captureTime').val('');

        let catchData = {
            angler,
            weight,
            species,
            location,
            bait,
            captureTime
        };

        let postCatchRequest = {
            method: 'POST',
            url: `${baseUrl}/${appId}/biggestCatches`,
            data: JSON.stringify(catchData),
            headers: {
                Authorization: basicAuth
            },
            contentType
        };

        $.ajax(postCatchRequest)
            .then(loadCatches)
            .catch(displayError);
    }

    function updateCatch(event) {
        let dataId = $(event.target).parent().attr('data-id');

        let angler = $(`.catch[data-id="${dataId}"] .angler`).val();
        let weight = Number($(`.catch[data-id="${dataId}"] .weight`).val());
        let species = $(`.catch[data-id="${dataId}"] .species`).val();
        let location = $(`.catch[data-id="${dataId}"] .location`).val();
        let bait = $(`.catch[data-id="${dataId}"] .bait`).val();
        let captureTime = Number($(`.catch[data-id="${dataId}"] .captureTime`).val());
        let catchData = {
            angler,
            weight,
            species,
            location,
            bait,
            captureTime
        };

        let putCatchRequest = {
            method: 'PUT',
            url: `${baseUrl}/${appId}/biggestCatches/${dataId}`,
            data: JSON.stringify(catchData),
            headers: {
                Authorization: basicAuth
            },
            contentType
        };

        $.ajax(putCatchRequest)
            .then(loadCatches)
            .catch(displayError);
    }
    
    function deleteCatch(event) {
        let dataId = $(event.target).parent().attr('data-id');

        let deleteCatchRequest = {
            method: 'DELETE',
            url: `${baseUrl}/${appId}/biggestCatches/${dataId}`,
            headers: {
                Authorization: basicAuth
            }
        };

        $.ajax(deleteCatchRequest)
            .then(loadCatches)
            .catch(displayError);
    }

    function displayCatches(catches) {
        $('#catches').empty();
        for (let caughtFish of catches) {
            let updateButton = $('<button class="update">')
                .text('Update')
                .on('click', updateCatch);
            let deleteButton = $('<button class="delete">')
                .text('Delete')
                .on('click', deleteCatch);

            $('#catches')
                .append($('<div class="catch">')
                    .attr('data-id', caughtFish._id)
                    .append($('<label>').text('Angler'))
                    .append($('<input type="text" class="angler">').val(caughtFish.angler))
                    .append($('<label>').text('Weight'))
                    .append($('<input type="number" class="weight">').val(caughtFish.weight))
                    .append($('<label>').text('Species'))
                    .append($('<input type="text" class="species">').val(caughtFish.species))
                    .append($('<label>').text('Location'))
                    .append($('<input type="text" class="location">').val(caughtFish.location))
                    .append($('<label>').text('Bait'))
                    .append($('<input type="text" class="bait">').val(caughtFish.bait))
                    .append($('<label>').text('Capture Time'))
                    .append($('<input type="number" class="captureTime">').val(caughtFish.captureTime))
                    .append($(updateButton))
                    .append($(deleteButton)));
        }
    }
    
    function displayError(error) {
        $('#catches').html(`Error: ${error.status} (${error.statusText})`);
    }
}