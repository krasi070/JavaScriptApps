function getInfo() {
    const baseUrl = 'https://judgetests.firebaseio.com/businfo';

    $('#stopName').text('');
    $('#buses').empty();
    let request = {
        method: 'GET',
        url: baseUrl + '/' + $('#stopId').val() + '.json',
        success: displayBusInfo,
        error: displayError
    };
    
    $.ajax(request);
    
    function displayBusInfo(info) {
        $('#stopName').text(info.name);
        for (let busId in info.buses) {
            $('#buses').append($('<li>').text(`Bus ${busId} arrives in ${info.buses[busId]} minutes`));
        }
    }
    
    function displayError() {
        $('#stopName').text('Error');
    }
}