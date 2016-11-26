function attachEvents() {
    const baseUrl = 'https://judgetests.firebaseio.com';
    $('#submit').on('click', getForecast);

    function getForecast() {
        $('#forecast').css('display', '');
        $('#forecast span').remove();

        let getLocationsRequest = {
            method: 'GET',
            url: `${baseUrl}/locations.json`
        };

        $.ajax(getLocationsRequest)
            .then((locations) => {
                loadCurrentConditions(locations);
                loadThreeDayForecast(locations);
            })
            .catch(displayError);
    }

    function loadCurrentConditions(locations) {
        let locationData = locations.filter(l => l.name == $('#location').val())[0];
        let getCurrentConditionsRequest = {
            method: 'GET',
            url: `${baseUrl}/forecast/today/${locationData.code}.json`
        };

        $.ajax(getCurrentConditionsRequest)
            .then(displayCurrentConditions)
            .catch(displayError);
    }

    function displayCurrentConditions(currConditions) {
        let locationName = currConditions.name;
        let lowHighTemp = `${currConditions.forecast.low}&#176;/${currConditions.forecast.high}&#176;`;
        let condition = currConditions.forecast.condition;

        $('#current')
            .append($('<span class="condition symbol">')
                .html(getWeatherSymbol(condition)))
            .append($('<span class="condition">')
                .append($('<span class="forecast-data">')
                    .text(locationName))
                .append($('<span class="forecast-data">')
                    .html(lowHighTemp))
                .append($('<span class="forecast-data">')
                    .text(condition)));
    }

    function loadThreeDayForecast(locations) {
        let locationData = locations.filter(l => l.name == $('#location').val())[0];
        let getUpcomingConditionsRequest = {
            method: 'GET',
            url: `${baseUrl}/forecast/upcoming/${locationData.code}.json`
        };

        $.ajax(getUpcomingConditionsRequest)
            .then(displayUpcomingConditions)
            .catch(displayError);
    }

    function displayUpcomingConditions(upcomingConditions) {
        let locationName = upcomingConditions.name;
        for (let forecast of upcomingConditions.forecast) {
            let lowHighTemp = `${forecast.low}&#176;/${forecast.high}&#176;`;
            let condition = forecast.condition;

            $('#upcoming')
                .append($('<span class="upcoming">')
                    .append($('<span class="symbol">')
                        .html(getWeatherSymbol(condition)))
                    .append($('<span class="forecast-data">')
                        .html(lowHighTemp))
                    .append($('<span class="forecast-data">')
                        .text(condition)));
        }
    }

    function displayError() {
        $('#forecast')
            .append($('<span>').text('Error'))
            .css('display', '');
    }

    function getWeatherSymbol(weather) {
        if (weather.toLowerCase() == 'sunny') {
            return '&#x2600;';
        } else if (weather.toLowerCase() == 'partly sunny') {
            return '&#x26C5;';
        } else if (weather.toLowerCase() == 'overcast') {
            return '&#x2601;';
        } else if (weather.toLowerCase() == 'rain') {
            return '&#x2614;';
        }
    }
}