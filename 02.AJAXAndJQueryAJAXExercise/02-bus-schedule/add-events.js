function addEvents() {
    const baseUrl = 'https://judgetests.firebaseio.com/schedule';
    $('#depart').on('click', depart);
    $('#arrive').on('click', arrive);

    let nextStopId = 'depot';
    let stopName = '';
    function depart() {
        let request = {
            method: 'GET',
            url: baseUrl + '/' + nextStopId + '.json',
            success: (stopData) => {
                $('#depart').attr('disabled', true);
                $('#arrive').removeAttr('disabled');
                nextStopId = stopData.next;
                stopName = stopData.name;
                $('#info span').text(`Next stop ${stopData.name}`);
            },
            error: displayError
        };

        $.ajax(request);
    }

    function arrive() {
        $('#depart').removeAttr('disabled');
        $('#arrive').attr('disabled', true);
        $('#info span').text(`Arriving at ${stopName}`);
    }

    function displayError() {
        $('#info span').text('Error');
        $('#depart').attr('disabled', true);
        $('#arrive').attr('disabled', true);
    }

    return {
        depart,
        arrive
    };
}