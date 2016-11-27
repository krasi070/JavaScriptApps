const baseUrl = 'https://baas.kinvey.com/appdata';
const appId = 'kid_BJXTsSi-e';
const username = 'guest';
const password = 'guest';
const basicAuth = `Basic ${btoa(username + ':' + password)}`;

function listStudents() {
    let getStudentsRequest = {
        method: 'GET',
        url: `${baseUrl}/${appId}/students`,
        headers: {
            Authorization: basicAuth
        }
    };

    $.ajax(getStudentsRequest)
        .then(displayStudents)
        .catch(displayError);
}

function displayStudents(students) {
    students = students.sort((a, b) => a.ID - b.ID);
    for (let student of students) {
        let tableRow = $('<tr>')
            .append($('<td>').text(student.ID))
            .append($('<td>').text(student.FirstName))
            .append($('<td>').text(student.LastName))
            .append($('<td>').text(student.FacultyNumber))
            .append($('<td>').text(student.Grade));

        $('#results').append($(tableRow));
    }
}

function displayError(error) {
    $(document.body).html(`Error: ${error.status} (${error.statusText})`);
}