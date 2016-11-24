function loadCommits() {
    const baseUrl = 'https://api.github.com/repos';
    let username = $('#username').val();
    let repository = $('#repo').val();

    let getCommitsRequest = {
        method: 'GET',
        url: baseUrl + '/' + username + '/' + repository + '/commits'
    };

    $.ajax(getCommitsRequest)
        .then(displayCommits)
        .catch(displayError);
    
    function displayCommits(commits) {
        $('#commits').empty();
        for (let commit of commits) {
            $('#commits')
                .append($('<li>').text(`${commit.commit.author.name}: ${commit.commit.message}`));
        }
    }
    
    function displayError(error) {
        $('#commits').empty();
        $('#commits')
            .append($('<li>').text(`Error: ${error.status} (${error.statusText})`));
    }
}