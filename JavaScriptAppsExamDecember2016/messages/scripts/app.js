const baseUrl = 'https://baas.kinvey.com';
const appId = 'kid_H1kgad5Qe';
const appSecret = '2001204cb1874ce9b75a236ccffbd4e7';
const basicAuth = `Basic ${btoa(appId + ':' + appSecret)}`;
const contentType = 'application/json';
const basicAuthHeaders = {
    Authorization: basicAuth,
    contentType
};

function startApp() {
    sessionStorage.clear();
    attachEvents();
    showHideMenuLinks();
    showAppHomeView();
}

function attachEvents() {
    $('form').on('submit', function (event) {
        event.preventDefault();
    });

    // Menu links
    $('#linkMenuAppHome').on('click', showAppHomeView);
    $('#linkMenuLogin').on('click', showLoginView);
    $('#linkMenuRegister').on('click', showRegisterView);
    $('#linkMenuUserHome').on('click', showUserHomeView);
    $('#linkMenuMyMessages').on('click', listMyMessages);
    $('#linkMenuArchiveSent').on('click', listSentMessages);
    $('#linkMenuSendMessage').on('click', showSendMessageView);
    $('#linkMenuLogout').on('click', logoutUser);

    // User Home links
    $('#linkUserHomeMyMessages').on('click', listMyMessages);
    $('#linkUserHomeArchiveSent').on('click', listSentMessages);
    $('#linkUserHomeSendMessage').on('click', showSendMessageView);

    // Form submits
    $('#formLogin').on('submit', loginUser);
    $('#formRegister').on('submit', registerUser);
    $('#formSendMessage').on('submit', sendMessage);

    // Box events
    $('#infoBox').on('click', function () {
        $('#infoBox').fadeOut();
    });

    $('#errorBox').on('click', function () {
        $('#errorBox').fadeOut();
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
    if (sessionStorage.getItem('authToken')) {
        $('#linkMenuAppHome').hide();
        $('#linkMenuLogin').hide();
        $('#linkMenuRegister').hide();
        $('#linkMenuUserHome').show();
        $('#linkMenuMyMessages').show();
        $('#linkMenuArchiveSent').show();
        $('#linkMenuSendMessage').show();
        $('#linkMenuLogout').show();
    } else {
        $('#linkMenuAppHome').show();
        $('#linkMenuLogin').show();
        $('#linkMenuRegister').show();
        $('#linkMenuUserHome').hide();
        $('#linkMenuMyMessages').hide();
        $('#linkMenuArchiveSent').hide();
        $('#linkMenuSendMessage').hide();
        $('#linkMenuLogout').hide();
        $('#spanMenuLoggedInUser').text('');
    }
}

function showView(viewName) {
    $('main > section').hide();
    $(`#${viewName}`).show();
}

function showAppHomeView() {
    showView('viewAppHome');
}

function showLoginView() {
    $('#formLogin').trigger('reset');
    showView('viewLogin');
}

function loginUser() {
    let username = $('#formLogin input[name=username]').val().trim();
    let password = $('#formLogin input[name=password]').val();
    let userData = {
        username,
        password
    };

    let loginUserRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}/login`,
        data: userData,
        headers: basicAuthHeaders
    };
    
    $.ajax(loginUserRequest)
        .then(successLogin)
        .catch(handleAjaxError);

    function successLogin(userData) {
        showAppInUserMode(userData);
        showInfo('Login successful.');
    }
}

function showRegisterView() {
    $('#formRegister').trigger('reset');
    showView('viewRegister');
}

function registerUser() {
    let username = $('#formRegister input[name=username]').val().trim();
    let password = $('#formRegister input[name=password]').val();
    let name = $('#formRegister input[name=name]').val().trim();
    let userData = {
        username,
        password
    };

    if (name != '') {
        userData.name = name;
    }

    let registerUserRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}`,
        data: userData,
        headers: basicAuthHeaders
    };

    $.ajax(registerUserRequest)
        .then(successRegister)
        .catch(handleAjaxError);

    function successRegister(userData) {
        showAppInUserMode(userData);
        showInfo('User registration successful.');
    }
}

function saveAuthInSession(userData) {
    sessionStorage.setItem('username', userData.username);
    if (userData.name) {
        sessionStorage.setItem('name', userData.name);
    }

    sessionStorage.setItem('userId', userData._id);
    sessionStorage.setItem('authToken', userData._kmd.authtoken);
}

function showAppInUserMode(userData) {
    saveAuthInSession(userData);
    showHideMenuLinks();
    let name = userData.name ?
        userData.name :
        userData.username;
    $('#spanMenuLoggedInUser').text(`Welcome, ${name}!`);
    showUserHomeView();
}

function logoutUser() {
    let logoutUserRequest = {
        method: 'POST',
        url: `${baseUrl}/user/${appId}/_logout`,
        headers: getKinveyAuthHeaders()
    };

    $.ajax(logoutUserRequest)
        .then(successLogout)
        .catch(handleAjaxError);

    function successLogout() {
        sessionStorage.clear();
        $('#spanMenuLoggedInUser').text('');
        showHideMenuLinks();
        showLoginView();
        // Show App Home View
        // showAppHomeView();
        showInfo('Logout successful.');
    }
}

function showUserHomeView() {
    $('#viewUserHomeHeading').text($('#spanMenuLoggedInUser').text());
    showView('viewUserHome');
}

function showMyMessagesView() {
    showView('viewMyMessages');
}

function listMyMessages() {
    $('#myMessages').empty();
    showMyMessagesView();
    let getMessagesSentToUserRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/messages?query={"recipient_username":"${sessionStorage.getItem('username')}"}`,
        headers: getKinveyAuthHeaders()
    };

    $.ajax(getMessagesSentToUserRequest)
        .then(printMessagesTable)
        .catch(handleAjaxError);

    function printMessagesTable(messages) {
        let table = $('<table>')
            .append($('<thead>')
                .append($('<tr>')
                    .append($('<th>')
                        .text('From'))
                    .append($('<th>')
                        .text('Message'))
                    .append($('<th>')
                        .text('Date Received'))));

        let tableBody = $('<tbody>');
        for (let message of messages) {
            let sender = formatSender(message.sender_name, message.sender_username);
            let text = message.text;
            let dateReceived = formatDate(message._kmd.lmt);
            $(tableBody)
                .append($('<tr>')
                    .append($('<td>')
                        .text(sender))
                    .append($('<td>')
                        .text(text))
                    .append($('<td>')
                        .text(dateReceived)));
        }

        $(table).append(tableBody);

        $('#myMessages').append(table);
    }
}

function showArchiveSentView() {
    showView('viewArchiveSent');
}

function listSentMessages() {
    $('#sentMessages').empty();
    showArchiveSentView();
    let getMessagesSentByUserRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appId}/messages?query={"sender_username":"${sessionStorage.getItem('username')}"}`,
        headers: getKinveyAuthHeaders()
    };

    $.ajax(getMessagesSentByUserRequest)
        .then(printMessagesTable)
        .catch(handleAjaxError);

    function printMessagesTable(messages) {
        let table = $('<table>')
            .append($('<thead>')
                .append($('<tr>')
                    .append($('<th>')
                        .text('To'))
                    .append($('<th>')
                        .text('Message'))
                    .append($('<th>')
                        .text('Date Sent'))
                    .append($('<th>')
                        .text('Actions'))));

        let tableBody = $('<tbody>');
        for (let message of messages) {
            let recipient = message.recipient_username;
            let text = message.text;
            let dateSent = formatDate(message._kmd.lmt);
            $(tableBody)
                .append($('<tr>')
                    .append($('<td>')
                        .text(recipient))
                    .append($('<td>')
                        .text(text))
                    .append($('<td>')
                        .text(dateSent))
                    .append($('<td>')
                        .append($('<button>')
                            .text('Delete')
                            .on('click', () => {
                                deleteMessage(message._id);
                            }))));
        }

        $(table).append(tableBody);

        $('#sentMessages').append(table);
    }
}

function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate())) {
        return '';
    }

    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}

function formatSender(name, username) {
    if (!name) {
        return username;
    }

    return username + ' (' + name + ')';
}

function showSendMessageView() {
    $('#formSendMessage').trigger('reset');
    loadUsers();
    showView('viewSendMessage');

    function loadUsers() {
        let getAllUsersRequest = {
            method: 'GET',
            url: `${baseUrl}/user/${appId}`,
            headers: getKinveyAuthHeaders()
        };

        $.ajax(getAllUsersRequest)
            .then(putUsersInSelect)
            .catch(handleAjaxError);

        function putUsersInSelect(users) {
            $('#msgRecipientUsername').empty();
            for (let user of users) {
                if (user._id == sessionStorage.getItem('userId')) {
                    continue;
                }

                $('#msgRecipientUsername')
                    .append($('<option>')
                        .attr('value', user.username)
                        .text(formatSender(user.name, user.username)));
            }
        }
    }
}

function sendMessage() {
    let sender_username = sessionStorage.getItem('username');
    let sender_name = sessionStorage.getItem('name');
    let recipient_username = $('#msgRecipientUsername option:selected').val();
    let text = $('#msgText').val().trim();
    let messageData = {
        sender_username,
        sender_name,
        recipient_username,
        text
    };

    let createMessageRequest = {
        method: 'POST',
        url: `${baseUrl}/appdata/${appId}/messages`,
        data: messageData,
        headers: getKinveyAuthHeaders()
    };

    $.ajax(createMessageRequest)
        .then(() => {
            listSentMessages();
            showInfo('Message sent.');
        })
        .catch(handleAjaxError);
}

function deleteMessage(id) {
    let deleteMessageRequest = {
        method: 'DELETE',
        url: `${baseUrl}/appdata/${appId}/messages/${id}`,
        headers: getKinveyAuthHeaders()
    };

    $.ajax(deleteMessageRequest)
        .then(() => {
            listSentMessages();
            showInfo('Message deleted.');
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

function getKinveyAuthHeaders() {
    return {
        contentType,
        Authorization: `Kinvey ${sessionStorage.getItem('authToken')}`
    };
}

function handleAjaxError(error) {
    let errorMsg = JSON.stringify(error);
    if (error.readyState === 0) {
        errorMsg = "Cannot connect due to network error.";
    }

    if (error.responseJSON && error.responseJSON.description) {
        errorMsg = error.responseJSON.description;
    }

    showError(errorMsg);
}

function showError(errorMsg) {
    $('#errorBox').text("Error: " + errorMsg);
    $('#errorBox').show();
}