const baseUrl = 'https://baas.kinvey.com';
const appId = 'kid_BJLFXKhfg';
const appSecret = '65305def75ce48f6981b1e1799147589';
const basicAuth = `Basic ${btoa(appId + ':' + appSecret)}`;

function startApp() {
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    $('#linkHome').on('click', showHomeView);
    $('#linkLogin').on('click', showLoginView);
    $('#linkRegister').on('click', showRegisterView);
    $('#linkListAds').on('click', listAds);
    $('#linkCreateAd').on('click', showCreateAdView);
    $('#linkLogout').on('click', logoutUser);

    $('#buttonLoginUser').on('click', loginUser);
    $('#buttonRegisterUser').on('click', registerUser);
    $('#buttonCreateAd').on('click', createAd);
    $('#buttonEditAd').on('click', editAd);

    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    $(document).on({
        ajaxStart: function() {
            $("#loadingBox").show()
        },
        ajaxStop: function() {
            $("#loadingBox").hide()
        }
    });
}

function showHideMenuLinks() {
    if (!sessionStorage.getItem('authToken')) {
        $('#linkHome').show();
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();
        $('#linkLogout').hide();
    } else {
        $('#linkHome').show();
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListAds').show();
        $('#linkCreateAd').show();
        $('#linkLogout').show();
    }
}

function showView(viewName) {
    $('main section').hide();
    $(`#${viewName}`).show();
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
}

function loginUser() {
    let username = $('#formLogin input[name=username]').val().trim();
    let password = $('#formLogin input[name=passwd]').val().trim();
    let data = {
        username,
        password
    };

    let loginUserRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}/login`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(loginUserRequest)
        .then(loginSuccess)
        .catch(handleAjaxError);

    function loginSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listAds();
        showInfo('Login successful.');
    }
}

function showRegisterView() {
    showView('viewRegister');
}

function registerUser() {
    let username = $('#formRegister input[name=username]').val().trim();
    let password = $('#formRegister input[name=passwd]').val().trim();
    let data = {
        username,
        password
    };

    let registerUserRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}`,
        data,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(registerUserRequest)
        .then(registerSuccess)
        .catch(handleAjaxError);

    function registerSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listAds();
        showInfo('Register successful.');
    }
}

function logoutUser() {
    sessionStorage.clear();
    showHideMenuLinks();
    showHomeView();
    showInfo('Logout successful.');
}

function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
}

function listAds() {
    $('#ads').empty();
    showView('viewAds');
    let getAdsRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/adverts`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(getAdsRequest)
        .then((ads) => {
            showAds(ads);
            showInfo('Successfully loaded ads.');
        })
        .catch(handleAjaxError);

    function showAds(ads) {
        if (ads.length == 0) {
            $('#ads').append('<i>There are no ads. Why don\'t you go create some?</i>');
        } else {
            let adsTable = $('<table>')
                .append($('<tr>')
                    .append($('<th>')
                        .text('Title'))
                    .append($('<th>')
                        .text('Description'))
                    .append($('<th>')
                        .text('Publisher'))
                    .append($('<th>')
                        .text('Date Published'))
                    .append($('<th>')
                        .text('Price'))
                    .append($('<th>')
                        .text('Actions')));

            for (let ad of ads) {
                let adRow = createAdRows(ad);
                $(adsTable).append(adRow);
            }

            $('#ads').append(adsTable);
        }

        function createAdRows(ad) {
            let datePublished = new Date(ad.dateOfPublishing);
            let tableRowAd = $('<tr>')
                .append($('<td>')
                    .text(ad.title))
                .append($('<td>')
                    .text(ad.description))
                .append($('<td>')
                    .text(ad.publisher))
                .append($('<td>')
                    .text(`${datePublished.getFullYear()}-${datePublished.getMonth() + 1}-${datePublished.getDate()}`))
                .append($('<td>')
                    .text(Number(ad.price).toFixed(2)));

            if (ad._acl.creator == sessionStorage.getItem('userId')) {
                return $(tableRowAd)
                    .append($('<td>')
                        .append($('<a href="#">')
                            .text('[Delete]')
                            .on('click', () => {
                                deleteAd(ad._id);
                            }))
                        .append(' ')
                        .append($('<a href="#">')
                            .text('[Edit]')
                            .on('click', () => {
                                showEditAdView(ad._id)
                            })));
            }

            return $(tableRowAd)
                .append($('<td>')
                    .append('<i>[Not available]</i>'));
        }
    }
}

function showCreateAdView() {
    showView('viewCreateAd');
}

function createAd() {
    let getPublisherRequest = {
        method: 'GET',
        url: `${baseUrl}/user/${appId}/${sessionStorage.getItem('userId')}`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(getPublisherRequest)
        .then(afterGettingPublisher)
        .catch(handleAjaxError);

    function afterGettingPublisher(publisher) {
        let data = {
            title: $('#formCreateAd input[name=title]').val().trim(),
            description: $('#formCreateAd textarea[name=description]').val().trim(),
            publisher: publisher.username,
            dateOfPublishing: $('#formCreateAd input[name=datePublished]').val(),
            price: Number($('#formCreateAd input[name=price]').val().trim())
        };

        let createAdRequest = {
            method: 'POST',
            url: `${baseUrl}/appdata/${appId}/adverts`,
            data,
            headers: getKinveyUserAuthHeaders()
        };

        $.ajax(createAdRequest)
            .then(() => {
                listAds();
                showInfo('Ad successfully created.');
            })
            .catch(handleAjaxError);
    }
}

function showEditAdView(id) {
    showView('viewEditAd');
    let getAdToEditRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/adverts/${id}`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(getAdToEditRequest)
        .then(afterGettingAd)
        .catch(handleAjaxError);

    function afterGettingAd(ad) {
        $('#formEditAd input[name=id]').val(ad._id);
        $('#formEditAd input[name=publisher]').val(ad.publisher);
        $('#formEditAd input[name=title]').val(ad.title);
        $('#formEditAd textarea[name=description]').val(ad.description);
        $('#formEditAd input[name=datePublished]').val(ad.dateOfPublishing);
        $('#formEditAd input[name=price]').val(ad.price);
    }
}

function editAd() {
    let id = $('#formEditAd input[name=id]').val();
    let data = {
        publisher: $('#formEditAd input[name=publisher]').val().trim(),
        title: $('#formEditAd input[name=title]').val().trim(),
        description: $('#formEditAd textarea[name=description]').val().trim(),
        dateOfPublishing: $('#formEditAd input[name=datePublished]').val(),
        price: Number($('#formEditAd input[name=price]').val().trim())
    };

    let editAdRequest = {
        method: 'PUT',
        url: `${baseUrl}/appdata/${appId}/adverts/${id}`,
        data,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(editAdRequest)
        .then(() => {
            listAds();
            showInfo('Successfully updated ad.');
        })
        .catch(handleAjaxError);
}

function deleteAd(id) {
    let deleteAdRequest = {
        method: 'DELETE',
        url: `${baseUrl}/appdata/${appId}/adverts/${id}`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(deleteAdRequest)
        .then(() => {
            listAds();
            showInfo('Ad deleted successfully.');
        })
        .catch(handleAjaxError);
}

function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function() {
        $('#infoBox').fadeOut();
    }, 3000);
}

function showError(errorMsg) {
    $('#errorBox').text("Error: " + errorMsg);
    $('#errorBox').show();
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0) {
        errorMsg = "Cannot connect due to network error.";
    }

    if (response.responseJSON &&
        response.responseJSON.description) {
        errorMsg = response.responseJSON.description;
    }

    showError(errorMsg);
}

function getKinveyUserAuthHeaders() {
    return {
        Authorization: `Kinvey ${sessionStorage.getItem('authToken')}`
    };
}