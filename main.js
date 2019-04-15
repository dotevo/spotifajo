function download(id, file) {
    $.get(file, function (data) {
        let kantoj = data['tracks'];
        for(let i = 0; i< kantoj.length; i++) {
            $(id).append(
                $('<li class="list-group-item d-flex justify-content-between align-items-center"><span><b>' + kantoj[i]['popularity'] + '</b> ' + kantoj[i]['name'] + ' - <i>' + kantoj[i]['artist'] + '</i><span></li>')
            );
        }
        console.log(kantoj)

    })
}

function downloadList(id, name) {
    $.get(name, function (data) {
        let k = data.split('\n');
        console.log(k[k.length - 2])
        download(id, k[k.length - 2])
    })
}

$(document).ready(function() {
    downloadList('#ludlisto_plena', 'plena.txt');
    downloadList('#ludlisto_top100', 'top100.txt');
});
