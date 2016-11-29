const baseUrl = 'https://baas.kinvey.com';
const appKey = 'kid_Sy0gXR-U';
const appSecret = 'e53b44f10a48453cbc2e9127eec685a4';
const basicAuth = `Basic ${btoa(appKey + ':' + appSecret)}`;

function startApp() {
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');
    $("#formLogin").submit(loginUser);
    $("form").submit(function(e) { e.preventDefault() });

    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logoutUser);

    $("#formLogin input[type='submit']").click(loginUser);
    $("#formRegister input[type='submit']").click(registerUser);
    $("#formCreateBook input[type='submit']").click(createBook);
    $("#formEditBook input[type='submit']").click(editBook);

    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });
}

function showHideMenuLinks() {
    $("#linkHome").show();
    if (sessionStorage.getItem('authToken')) {
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkListBooks").show();
        $("#linkCreateBook").show();
        $("#linkLogout").show();
    } else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkListBooks").hide();
        $("#linkCreateBook").hide();
        $("#linkLogout").hide();
    }
}

function showView(viewName) {
    $('main > section').hide();
    $('#' + viewName).show();
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
    $('#formLogin').trigger('reset');
}

function showRegisterView() {
    $('#formRegister').trigger('reset');
    showView('viewRegister');
}

function showCreateBookView() {
    $('#formCreateBook').trigger('reset');
    showView('viewCreateBook');
}

function loginUser() {
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=passwd]').val()
    };

    let loginUserRequest = {
        method: "POST",
        url: `${baseUrl}/user/${appKey}/login`,
        headers: {
            Authorization: basicAuth
        },
        data: userData
    };

    $.ajax(loginUserRequest)
        .then(loginSuccess)
        .catch(handleAjaxError);

    function loginSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listBooks();
        showInfo('Login successful.');
    }
}

function registerUser() {
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=passwd]').val()
    };

    let registerUserRequest = {
        method: "POST",
        url: `${baseUrl}/user/${appKey}`,
        headers: {
            Authorization: basicAuth
        },
        data: userData
    };

    $.ajax(registerUserRequest)
        .then(registerSuccess)
        .catch(handleAjaxError);

    function registerSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listBooks();
        showInfo('User registration successful.');
    }
}

function saveAuthInSession(userInfo) {
    let userAuth = userInfo._kmd.authtoken;
    sessionStorage.setItem('authToken', userAuth);
    let userId = userInfo._id;
    sessionStorage.setItem('userId', userId);
    let username = userInfo.username;
    $('#loggedInUser').text("Welcome, " + username + "!");
}

function logoutUser() {
    sessionStorage.clear();
    $('#loggedInUser').text("");
    showHideMenuLinks();
    showView('viewHome');
    showInfo('Logout successful.');
}

function listBooks() {
    $('#books').empty();
    showView('viewBooks');
    let getBooksRequest = {
        method: "GET",
        url: `${baseUrl}/appdata/${appKey}/books`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(getBooksRequest)
        .then(loadBooksSuccess)
        .catch(handleAjaxError);

    function loadBooksSuccess(books) {
        showInfo('Books loaded.');
        if (books.length == 0) {
            $('#books').text('No books in the library.');
        } else {
            let booksTable = $('<table>')
                .append($('<tr>').append(
                    '<th>Title</th><th>Author</th>',
                    '<th>Description</th><th>Actions</th>'));
            console.log(booksTable);
            for (let book of books) {
                appendBookRow(book, booksTable);
            }

            $('#books').append(booksTable);
        }

        function appendBookRow(book, booksTable) {
            let links = [];
            if (book._acl.creator == sessionStorage['userId']) {
                let deleteLink = $('<a href="#">[Delete]</a>')
                    .click(deleteBook.bind(this, book));
                let editLink = $('<a href="#">[Edit]</a>')
                    .click(loadBookForEdit.bind(this, book));
                links = [deleteLink, ' ', editLink];
            }

            booksTable.append($('<tr>').append(
                $('<td>').text(book.title),
                $('<td>').text(book.author),
                $('<td>').text(book.description),
                $('<td>').append(links)
            ));
        }
    }
}

function createBook() {
    let bookData = {
        title: $('#formCreateBook input[name=title]').val(),
        author: $('#formCreateBook input[name=author]').val(),
        description: $('#formCreateBook textarea[name=descr]').val()
    };

    let createBookRequest = {
        method: "POST",
        url: `${baseUrl}/appdata/${appKey}/books`,
        headers: getKinveyUserAuthHeaders(),
        data: bookData
    };

    $.ajax(createBookRequest)
        .then(createBookSuccess)
        .catch(handleAjaxError);

    function createBookSuccess(response) {
        listBooks();
        showInfo('Book created.');
    }
}

function loadBookForEdit(book) {
    let request = {
        method: "GET",
        url: `${baseUrl}/appdata/${appKey}/books/${book._id}`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(request)
        .then(loadBookForEditSuccess)
        .catch(handleAjaxError);

    function loadBookForEditSuccess(book) {
        $('#formEditBook input[name=id]').val(book._id);
        $('#formEditBook input[name=title]').val(book.title);
        $('#formEditBook input[name=author]')
            .val(book.author);
        $('#formEditBook textarea[name=descr]')
            .val(book.description);
        showView('viewEditBook');
    }
}

function editBook(book) {
    let bookData = {
        title: $('#formEditBook input[name=title]').val(),
        author: $('#formEditBook input[name=author]').val(),
        description:
            $('#formEditBook textarea[name=descr]').val()
    };

    let request = {
        method: "PUT",
        url: `${baseUrl}/appdata/${appKey}/books/${$('#formEditBook input[name=id]').val()}`,
        headers: getKinveyUserAuthHeaders(),
        data: bookData
    };

    $.ajax(request)
        .then(editBookSuccess)
        .catch(handleAjaxError);

    function editBookSuccess(response) {
        listBooks();
        showInfo('Book edited.');
    }
}

function deleteBook(book) {
    let deleteBookRequest = {
        method: "DELETE",
        url: `${baseUrl}/appdata/${appKey}/books/${book._id}`,
        headers: getKinveyUserAuthHeaders()
    };

    $.ajax(deleteBookRequest)
        .then(deleteBookSuccess)
        .catch(handleAjaxError);

    function deleteBookSuccess(response) {
        listBooks();
        showInfo('Book deleted.');
    }
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
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
}