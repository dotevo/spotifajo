function get(path, type, fun) {
    $.ajax({
        url: path,
        type: 'POST',
        dataType: type,
        success: fun,
        error: function() {
            $.get(path, fun);
        }
    });
}


function download(id, file) {
    get(file, 'JSON', function (data) {
        let kantoj = data['tracks'];
        $(id).empty();
        for(let i = 0; i< kantoj.length; i++) {
            $(id).append(
                $('<li class="list-group-item d-flex justify-content-between align-items-center"><span><b>' + kantoj[i]['popularity'] + '</b> ' + kantoj[i]['name'] + ' - <i>' + kantoj[i]['artist'] + '</i><span></li>')
            );
        }
        console.log(kantoj)

    })
}

function downloadList(id, name) {
    get(name, 'text', function (data) {
        let k = data.split('\n');
        console.log(k[k.length - 2])
        download(id, k[k.length - 2])
    })
}

function changePlaylist(id, file) {
    $('#spotify').attr('src', id);
    // Change spotify embeded
    downloadList('#ludlisto', file);
}

$(document).ready(function() {
    $('#btn_plena').on('click', () => {
        changePlaylist('https://open.spotify.com/embed/user/dotevo/playlist/7LYL5Mcc2oEBphWrKujpq3', 'plena.txt');
    }).click();
    $('#btn_top100').on('click', () => {
        changePlaylist('https://open.spotify.com/embed/user/dotevo/playlist/0eme5GZSMd9DlC84ETBZWU', 'top100.txt');
    });
});
