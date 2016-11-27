const baseUrl = 'https://baas.kinvey.com';
const appId = 'kid_BJ_Ke8hZg';
const username = 'guest';
const password = 'pass';
const basicAuth = `Basic ${btoa(username + ':' + password)}`;

function attachEvents() {
    $('#getVenues').on('click', getVenues);

    function getVenues() {
        let date = $('#venueDate').val().trim();
        $('#venueDate').val('');

        let getVenuesRequest = {
            method: 'POST',
            url: `${baseUrl}/rpc/${appId}/custom/calendar?query=${date}`,
            headers: {
                Authorization: basicAuth
            }
        };

        $.ajax(getVenuesRequest)
            .then(loadVenues)
            .catch(displayError);
    }

    function loadVenues(venuesIds) {
        $('#venue-info').empty();
        for (let id of venuesIds) {
            let getVenueRequest = {
                method: 'GET',
                url: `${baseUrl}/appdata/${appId}/venues/${id}`,
                headers: {
                    Authorization: basicAuth
                }
            };

            $.ajax(getVenueRequest)
                .then(displayVenue)
                .catch(displayError);
        }
    }

    function displayVenue(venue) {
        $('#venue-info')
            .append($(`<div class="venue" id="${venue._id}">`)
                .append($('<span class="venue-name">')
                    .append($('<input class="info" type="button" value="More info">')
                        .on('click', () => {
                            showMoreOrLessInfo(venue._id);
                        }))
                    .append(venue.name))
                .append($('<div class="venue-details" style="display: none">')
                    .append($('<table>')
                        .append($('<tr>')
                            .append($('<th>')
                                .text('Ticket Price'))
                            .append($('<th>')
                                .text('Quantity'))
                            .append($('<th>')))
                        .append($('<tr>')
                            .append($('<td class="venue-price">')
                                .text(`${venue.price} lv`))
                            .append($('<td>')
                                .append($('<select class="quantity">')
                                    .append($('<option value="1">')
                                        .text('1'))
                                    .append($('<option value="2">')
                                        .text('2'))
                                    .append($('<option value="3">')
                                        .text('3'))
                                    .append($('<option value="4">')
                                        .text('4'))
                                    .append($('<option value="5">')
                                        .text('5'))))
                            .append($('<td>')
                                .append($('<input class="purchase" type="button" value="Buy Tickets">')
                                    .on('click', () => {
                                        buyTickets(venue._id, venue.name, venue.price, $(`#${venue._id} option:selected`).text());
                                    })))))
                    .append($('<span class="head">')
                        .text('Venue description: '))
                    .append($('<p class="description">')
                        .text(venue.description))
                    .append($('<p class="description">')
                        .text(`Starting time: ${venue.startingHour}`))));
    }

    function buyTickets(id, name, price, quantity) {
        $('#venue-info').empty();
        $('#venue-info')
            .append($('<span class="head">')
                .text('Confirm purchase'))
            .append($('<div class="purchase-info">')
                .append($('<span>')
                    .text(name))
                .append($('<span>')
                    .text(`${quantity} x ${price}`))
                .append($('<span>')
                    .text(`Total: ${quantity * price} lv`))
                .append($('<input id="confirm" type="button" value="Confirm">')
                    .on('click', () => {
                        confirmPurchase(id, quantity);
                    })));
    }

    function confirmPurchase(id, quantity) {
        let confirmPurchaseRequest = {
            method: 'POST',
            url: `${baseUrl}/rpc/${appId}/custom/purchase?venue=${id}&qty=${quantity}`,
            headers: {
                Authorization: basicAuth
            }
        };

        $.ajax(confirmPurchaseRequest)
            .then(displayTicket)
            .catch(displayError);
    }

    function displayTicket(ticket) {
        $('#venue-info').empty();
        $('#venue-info')
            .append('You may print this page as your ticket.')
            .append(ticket.html);
    }

    function showMoreOrLessInfo(id) {
        if ($(`#${id} .info`).val() == 'More info') {
            $(`#${id} .venue-details`).css('display', 'block');
            $(`#${id} .info`).val('Less info');
        } else {
            $(`#${id} .venue-details`).css('display', 'none');
            $(`#${id} .info`).val('More info');
        }
    }

    function displayError(error) {
        $(document.body).empty();
        $(document.body)
            .append($('<span>')
                .text(`Error: ${error.status} (${error.statusText})`));
    }
}