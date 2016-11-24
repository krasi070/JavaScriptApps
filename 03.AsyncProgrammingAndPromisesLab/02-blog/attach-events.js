function attachEvents() {
    const baseUrl = 'https://baas.kinvey.com/appdata';
    const appId = 'kid_rk_v3pNfl';
    const username = 'krasi';
    const password = 'krasi';
    const basicAuthorization = {
        Authorization: 'Basic ' + btoa(username + ':' + password)
    };

    $('#btnLoadPosts').on('click', loadPosts);
    $('#btnViewPost').on('click', viewPost);

    function loadPosts() {
        let getPostsRequest = {
            method: 'GET',
            url: `${baseUrl}/${appId}/posts`,
            headers: basicAuthorization
        };

        $.ajax(getPostsRequest)
            .then(putPostOptions)
            .catch(displayError);
    }

    function viewPost() {
        let postId = $('#posts option:selected').val();
        let getPostRequest = {
            method: 'GET',
            url: `${baseUrl}/${appId}/posts/${postId}`,
            headers: basicAuthorization
        };

        $.ajax(getPostRequest)
            .then(loadComments)
            .catch(displayError);
    }

    function loadComments(postData) {
        $('#post-title').text(postData.title);
        $('#post-body').text(postData.body);

        let getCommentsRequest = {
            method: 'GET',
            url: `${baseUrl}/${appId}/comments?query={"post_id":"${postData._id}"}`,
            headers: basicAuthorization
        };

        $.ajax(getCommentsRequest)
            .then(displayComments)
            .catch(displayError);
    }

    function displayComments(comments) {
        $('#post-comments').empty();
        for (let comment of comments) {
            $('#post-comments').append($('<li>').text(comment.text));
        }
    }

    function putPostOptions(posts) {
        for (let post of posts) {
            $('#posts')
                .append($('<option>')
                    .text(post.title)
                    .val(post._id));
        }
    }

    function displayError(error) {
        let errorDiv = $('<div>')
            .text(`Error: ${error.status} (${error.statusText})`)
            .css('color', 'red');
        $(document.body).prepend($(errorDiv));

        setTimeout(function () {
            errorDiv.fadeOut(function () {
                $(errorDiv).remove();
            });
        }, 2000);
    }
}