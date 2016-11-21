function loadRepos() {
    $('#repos').empty();
    let request = {
        method: 'GET',
        url: 'https://api.github.com/users/' + $('#username').val() + '/repos',
        success: showRepos,
        error: showError
    };

    $('#username').val('');

    return $.ajax(request);

    function showRepos(repos) {
        for (let repository of repos) {
            $('#repos')
                .append($('<li>')
                    .append($(`<a href="${repository.html_url}">`).text(repository.full_name)))
        }
    }

    function showError() {
        $('#repos').append($('<li>').text('ERROR'));
    }
}