function loadRepos() {
    $('#repos').empty();
    $.get(`https://api.github.com/users/${$('#username').val()}/repos?per_page=1000`)
        .then(showRepos)
        .catch(showError);

    function showRepos(repos) {
        for (let repository of repos) {
            $('#repos')
                .append($('<li>')
                    .append($(`<a href="${repository.html_url}">`).text(repository.name)))
        }
    }

    function showError() {
        $('#repos').append($('<li>').text('ERROR'));
    }
}