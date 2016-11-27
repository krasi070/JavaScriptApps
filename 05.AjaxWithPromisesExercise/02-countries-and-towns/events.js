const baseUrl = 'https://baas.kinvey.com/appdata';
const appId = 'kid_HycFbSdGe';
const username = 'guest';
const password = 'guest';
const basicAuth = `Basic ${btoa(username + ':' + password)}`;

function addCountry() {
    let country = new Country($('#new-country').val().trim());
    $('#new-country').val('');

    let data = {
        name: country.name
    };

    let createCountryRequest = {
        method: 'POST',
        url: `${baseUrl}/${appId}/countries`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(createCountryRequest)
        .then(loadCountries)
        .catch(displayError);
}

function addTown() {
    let town = new Town($('#new-town').val().trim(), new Country($('#towns').attr('country')));
    $('#new-town').val('');

    let data = {
        name: town.name,
        country: town.country.name
    };

    let createCountryRequest = {
        method: 'POST',
        url: `${baseUrl}/${appId}/towns`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(createCountryRequest)
        .then(() => {
            loadTowns(town.country.name)
        })
        .catch(displayError);
}

function getTownsByCountry(successFunction, countryName) {
    let getTownsRequest = {
        method: 'GET',
        url: `${baseUrl}/${appId}/towns?query={"country":"${countryName}"}`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(getTownsRequest)
        .then(successFunction)
        .catch(displayError);
}

function loadCountries() {
    let getCountriesRequest = {
        method: 'GET',
        url: `${baseUrl}/${appId}/countries`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(getCountriesRequest)
        .then(displayCountries)
        .catch(displayError);
}

function loadTowns(countryName) {
    $('#countries').css('display', 'none');
    $('#towns').css('display', '');

    getTownsByCountry((data) => {
        displayTowns(data, countryName);
    }, countryName);
}

function displayCountries(data) {
    $('#countries-list').empty();

    let countries = [];
    for (let dataObj of data) {
        let country = new Country(dataObj.name);
        countries.push({
            country: country,
            id: dataObj._id
        });
    }

    for (let country of countries) {
        $('#countries-list')
            .append($('<li>')
                .attr('country-id', country.id)
                .append($('<span>')
                    .text(country.country.name + ' '))
                .append($('<button class="action">')
                    .text('Towns')
                    .on('click', () => {
                        loadTowns(country.country.name);
                    }))
                .append(' ')
                .append($('<button class="action">')
                    .text('Edit')
                    .on('click', () => {
                        editCountry(country.id);
                    }))
                .append(' ')
                .append($('<button class="action">')
                    .text('Delete')
                    .on('click', () => {
                        deleteCountry(country.id, country.country.name);
                    })));
    }
}

function displayTowns(data, countryName) {
    $('#towns').attr('country', countryName);
    $('#towns h1').text(`Towns in ${countryName}`);
    $('#towns-list').empty();

    let towns = [];
    for (let dataObj of data) {
        let town = new Town(dataObj.name, new Country(dataObj.country));
        towns.push({
            town,
            id: dataObj._id
        });
    }

    for (let town of towns) {
        $('#towns-list')
            .append($('<li>')
                .attr('town-id', town.id)
                .append($('<span>')
                    .text(town.town.name + ' '))
                .append($('<button class="action">')
                    .text('Edit')
                    .on('click', () => {
                        editTown(town.id, town.town.country.name);
                    }))
                .append(' ')
                .append($('<button class="action">')
                    .text('Delete')
                    .on('click', () => {
                        deleteTown(town.id, town.town.country.name);
                    })));
    }
}

function editTown(id, countryName) {
    let prevName = $(`li[town-id="${id}"] span`).text().trim();
    $(`li[town-id="${id}"]`).empty();
    $(`li[town-id="${id}"]`)
        .append($(`<input type="text" value="${prevName}">`))
        .append(' ')
        .append($('<button>')
            .text('Save')
            .on('click', () => {
                updateTown(id, countryName);
            }));
}

function updateTown(id, countryName) {
    let newName = $(`li[town-id="${id}"] input`).val().trim();

    let data = {
        name: newName,
        country: countryName
    };

    let updateTownRequest = {
        method: 'PUT',
        url: `${baseUrl}/${appId}/towns/${id}`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(updateTownRequest)
        .then(() => {
            loadTowns(countryName);
        })
        .catch(displayError);
}

function deleteTown(id, countryName) {
    let deleteTownRequest = {
        method: 'DELETE',
        url: `${baseUrl}/${appId}/towns/${id}`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(deleteTownRequest)
        .then(() => {
            loadTowns(countryName);
        })
        .catch(displayError);
}

function editCountry(id) {
    let prevCountryName = $(`li[country-id="${id}"] span`).text().trim();
    $(`li[country-id="${id}"]`).empty();
    $(`li[country-id="${id}"]`)
        .append($(`<input type="text" value="${prevCountryName}">`))
        .append(' ')
        .append($('<button>')
            .text('Save')
            .on('click', () => {
                updateCountry(id, prevCountryName);
            }));
}

function updateCountry(id, prevName) {
    let newName = $(`li[country-id="${id}"] input`).val().trim();

    let data = {
        name: newName
    };

    let updateCountryRequest = {
        method: 'PUT',
        url: `${baseUrl}/${appId}/countries/${id}`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(updateCountryRequest)
        .then(() => {
            updateCountryInTowns(prevName, newName);
            loadCountries();
        })
        .catch(displayError);
}

function updateCountryInTowns(prevName, newName) {
    getTownsByCountry((data) => {
        for (let town of data) {
            let updatedTown = {
                name: town.name,
                country: newName
            };

            let updateTownRequest = {
                method: 'PUT',
                url: `${baseUrl}/${appId}/towns/${town._id}`,
                data: updatedTown,
                headers: {
                    Authorization: basicAuth
                }
            };

            $.ajax(updateTownRequest)
                .then()
                .catch(displayError);
        }
    }, prevName);
}

function deleteCountry(id, name) {
    let deleteCountryRequest = {
        method: 'DELETE',
        url: `${baseUrl}/${appId}/countries/${id}`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(deleteCountryRequest)
        .then(() => {
            deleteCountryTowns(name);
            loadCountries();
        })
        .catch(displayError);
}

function deleteCountryTowns(name) {
    getTownsByCountry((data) => {
        for (let town of data) {
            let deleteTownRequest = {
                method: 'DELETE',
                url: `${baseUrl}/${appId}/towns/${town._id}`,
                headers: {
                    Authorization: basicAuth
                }
            };

            $.ajax(deleteTownRequest)
                .then()
                .catch(displayError);
        }
    }, name);
}

function backToCountries() {
    $('#countries').css('display', '');
    $('#towns').css('display', 'none');
}

function displayError(error) {
    $(document.body).empty();
    $(document.body)
        .append($('<span>')
            .text(`Error: ${error.status} (${error.statusText})`)
            .css('color', 'red'));
}