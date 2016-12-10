const baseUrl = 'https://baas.kinvey.com';
const appId = 'kid_S1_Ym18Qx';
const appSecret = '038eba227f424ab282022f222a40117b';
const basicAuth = `Basic ${btoa(appId + ':' + appSecret)}`;

function onStartApp() {
    sessionStorage.clear();
    hideShowMenuLinks();
    showHomeView();

    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    $("#info-box, #error-box").click(function() {
        $(this).fadeOut();
    });

    $(document).on({
        ajaxStart: function() { $("#loading-box").show() },
        ajaxStop: function() { $("#loading-box").hide() }
    });
}

function hideShowMenuLinks() {
    if (sessionStorage.getItem('userId')) {
        $('#link-home').show();
        $('#link-login').hide();
        $('#link-register').hide();
        $('#link-reviews').show();
        $('#link-write-review').show();
        $('#link-logout').show();
    } else {
        $('#link-home').show();
        $('#link-login').show();
        $('#link-register').show();
        $('#link-reviews').hide();
        $('#link-write-review').hide();
        $('#link-logout').hide();
    }
}

function showView(viewName) {
    $('main section').hide();
    $(`#${viewName}`).show();
}

function showHomeView() {
    showView('view-home');
}

function showLoginView() {
    $('#form-login').trigger('reset');
    showView('view-login');
}

function login() {
    let username = $('#form-login [name=username]').val().trim();
    let password = $('#form-login [name=password]').val().trim();
    let userData = {
        username,
        password
    };

    let loginRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}/login`,
        data: userData,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(loginRequest)
        .then(successLogin)
        .catch(handleAjaxError);

    function successLogin(userData) {
        saveUserDataInSession(userData);
        $('#logged-in-user').text(`Welcome, ${userData.username}!`);
        hideShowMenuLinks();
        showHomeView();
        showInfo('Successfully logged in.');
    }
}

function showRegisterView() {
    $('#form-register').trigger('reset');
    showView('view-register');
}

function register() {
    let username = $('#form-register [name=username]').val().trim();
    let password = $('#form-register [name=password]').val().trim();
    let userData = {
        username,
        password
    };

    let registerRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}`,
        data: userData,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(registerRequest)
        .then(successRegister)
        .catch(handleAjaxError);

    function successRegister(userData) {
        saveUserDataInSession(userData);
        $('#logged-in-user').text(`Welcome, ${userData.username}!`);
        hideShowMenuLinks();
        showHomeView();
        showInfo('Successfully registered.');
    }
}

function saveUserDataInSession(userData) {
    sessionStorage.setItem('userId', userData._id);
    sessionStorage.setItem('authToken', userData._kmd.authtoken);
}

function logout() {
    sessionStorage.clear();
    $('#logged-in-user').text('');
    hideShowMenuLinks();
    showHomeView();
    showInfo('Logged out successfully.');
}

function showReviewsView() {
    showView('view-reviews');
}

function listReviews() {
    $('#reviews').empty();
    showReviewsView();
    let getReviewsRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/games`,
        headers: {
            Authorization: getKinveyAuth()
        }
    };

    $.ajax(getReviewsRequest)
        .then(showReviews)
        .catch(handleAjaxError);

    function showReviews(reviews) {
        showInfo('Successfully loaded reviews.');
        if (reviews.length == 0) {
            $('#reviews').html('<i>No reviews. Why don\'t you go and be the first on to write a review.</i>');
        } else {
            let table = $('<table>')
                .append($('<tr>')
                    .append($('<th>')
                        .text('Game'))
                    .append($('<th>')
                        .text('Review'))
                    .append($('<th>')
                        .text('Score'))
                    .append($('<th>')
                        .text('Reviewed by'))
                    .append($('<th>')
                        .text('Actions')));

            for (let review of reviews) {
                let row = $('<tr>')
                    .append($('<td>')
                        .text(review.game))
                    .append($('<td>')
                        .text(review.review))
                    .append($('<td>')
                        .text(review.score))
                    .append($('<td>')
                        .text(review.user));

                if (review._acl.creator == sessionStorage.getItem('userId')) {
                    row
                        .append($('<td>')
                            .append($('<a href="#">')
                                .text('[Edit]')
                                .on('click', () => {
                                    showEditReviewView(review._id);
                                }))
                            .append(' ')
                            .append($('<a href="#">')
                                .text('[Delete]')
                                .on('click', () => {
                                    deleteReview(review._id);
                                })));
                } else {
                    row
                        .append($('<td>')
                            .html('<i>[Not available]</i>'));
                }

                $(table).append(row);
            }

            $('#reviews').append(table);
        }
    }
}

function showWriteReviewView() {
    $('#form-write-review').trigger('reset');
    showView('view-write-review');
}

function writeReview() {
    let game = $('#form-write-review input[name=game]').val().trim();
    let score = Number($('#form-write-review select option:selected').val());
    let review = $('#form-write-review textarea[name=review]').val().trim();
    let user = $('#logged-in-user').text().split(' ')[1];
    user = user.substr(0, user.length - 1);

    let reviewData = {
        game,
        score,
        review,
        user
    };

    let createReviewRequest = {
        method: 'POST',
        url: `${baseUrl}/appdata/${appId}/games`,
        data: reviewData,
        headers: {
            Authorization: getKinveyAuth()
        }
    };

    $.ajax(createReviewRequest)
        .then(() => {
            listReviews();
            showInfo('Successfully created your review.');
        })
        .catch(handleAjaxError);
}

function showEditReviewView(id) {
    getReviewById(id, prepareForEditing);
    showView('view-edit-review');
}

function prepareForEditing(review) {
    $('#form-edit-review input[name=id]').val(review._id);
    $('#form-edit-review input[name=game]').val(review.game);
    $('#form-edit-review select').val(review.score);
    $('#form-edit-review textarea[name=review]').val(review.review);
}

function getReviewById(id, successFunction) {
    let getReviewRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/games/${id}`,
        headers: {
            Authorization: getKinveyAuth()
        }
    };

    $.ajax(getReviewRequest)
        .then(successFunction)
        .catch(handleAjaxError);
}

function editReview() {
    let id = $('#form-edit-review input[name=id]').val();
    let game = $('#form-edit-review input[name=game]').val().trim();
    let score = Number($('#form-edit-review select').val());
    let review = $('#form-edit-review textarea[name=review]').val().trim();
    let user = $('#logged-in-user').text().split(' ')[1];
    user = user.substr(0, user.length - 1);

    let newReview = {
        game,
        score,
        review,
        user
    };

    let updateReviewRequest = {
        method: 'PUT',
        url: `${baseUrl}/appdata/${appId}/games/${id}`,
        data: newReview,
        headers: {
            Authorization: getKinveyAuth()
        }
    };

    $.ajax(updateReviewRequest)
        .then(() => {
            listReviews();
            showInfo('Successfully updated your review.');
        })
        .catch(handleAjaxError);
}

function deleteReview(id) {
    let deleteReviewRequest = {
        method: 'DELETE',
        url: `${baseUrl}/appdata/${appId}/games/${id}`,
        headers: {
            Authorization: getKinveyAuth()
        }
    };

    $.ajax(deleteReviewRequest)
        .then(() => {
            listReviews();
            showInfo('Successfully deleted review.');
        })
        .catch(handleAjaxError);
}

function showInfo(message) {
    $('#info-box').text(message);
    $('#info-box').show();
    setTimeout(function() {
        $('#info-box').fadeOut();
    }, 3000);
}

function showError(errorMsg) {
    $('#error-box').text("Error: " + errorMsg);
    $('#error-box').show();
}

function getKinveyAuth() {
    return `Kinvey ${sessionStorage.getItem('authToken')}`;
}

function handleAjaxError(error) {
    let errorMsg = JSON.stringify(error);

    if (error.responseJSON && error.responseJSON.description) {
        errorMsg = error.responseJSON.description;
    }

    showError(errorMsg);
}