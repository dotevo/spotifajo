var ludlisto = null;
var dosiero = null;
var ordo = 'popularity';
var komp = null;

function get(path, type) {
    return new Promise(function(f, r) {
        $.ajax({
            url: path,
            type: 'POST',
            dataType: type,
            success: function(data) {
                f(data);
            },
            error: function() {
                console.log('Err')
                $.get(path, function(data) {
                    f(data);
                });
            }
        });
    });
}

function download(id, file, func) {
    return new Promise(function(f, r) {
        console.log("Download... " + file);
        get(file, 'JSON').then(function(data) {
            f(data);
        });
    });
}

function getChange(kanto) {
    if(kanto['diff']==null) {
        return '↑';
    }
    if( kanto['diff'] < 0 )
        return '↓' + -1 *kanto['diff'];
    return '↑'  + kanto['diff'];
}

function downloadList(id, name) {
    get(name, 'text').then(function(data){
        $('#komp').empty();
        let k = data.split('\n');
        for(let i =0; i<k.length;i++) {
            //plena_2019-04-16T10:18:58.850Z.json
            var patt = new RegExp("([0-9\-\.:TZ]+).json");
            var res = patt.exec(k[i]);
            if(res == null) continue;
            let d = new Date(Date.parse(res[1]));
            console.log(d)
            $('#komp').append('<option value="' + k[i] + ' ">' + d.toLocaleDateString() + '</option>')
            if(komp == null) {
                komp = k[i];
            }
        }
        $('#komp').val(komp);
        return Promise.all([
            download(id, k[k.length - 2]),
            download(id, komp)
        ])
    }).then(function(data) {
        console.log(data)
        let kantojNovaj = data[0]['tracks'];
        let kantojMalnovaj = data[1]['tracks'];
        for (let i = 0; i< kantojMalnovaj.length; i++) {
            for (let j = 0; j< kantojNovaj.length; j++) {
                if (kantojMalnovaj[i]['name'] == kantojNovaj[j]['name'] && kantojMalnovaj[i]['artist'] == kantojNovaj[j]['artist']
                        && kantojMalnovaj[i]['album'] == kantojNovaj[j]['album']) {
                    kantojNovaj[j]['popularity_old'] = kantojMalnovaj[i]['popularity'];
                    kantojNovaj[j]['diff'] = kantojNovaj[j]['popularity'] - kantojNovaj[j]['popularity_old'];

                }
            }
        }

        kantojNovaj.sort(function(a, b) {
          if (parseInt(a[ordo]) < parseInt(b[ordo])) return 1;
          if (parseInt(a[ordo]) > parseInt(b[ordo])) return -1;
          return 0;
        });

        $(id).empty();
        for(let i = 0; i< kantojNovaj.length; i++) {
            $(id).append(
                $('<li class="list-group-item d-flex justify-content-between align-items-center"><i>' + kantojNovaj[i]['popularity'] + '<b> ' + kantojNovaj[i]['name'] + '</b> - ' + kantojNovaj[i]['artist'] + '</i><span class="badge badge-primary badge-pill">' + getChange(kantojNovaj[i]) + '</span></li>')
            );
        }
        console.log(kantojNovaj)
    });
}

function changePlaylist(id, file) {
    ludlisto = id;
    dosiero = file;
    $('#spotify').attr('src', id);
    // Change spotify embeded
    downloadList('#ludlisto', file);
}


function changeOrder(key) {
    console.log(key)
    ordo = key;
    downloadList('#ludlisto', dosiero);
}

$(document).ready(function() {
    $('#btn_plena').on('click', () => {
        changePlaylist('https://open.spotify.com/embed/user/dotevo/playlist/7LYL5Mcc2oEBphWrKujpq3', 'plena.txt');
    }).click();
    $('#ordo').on('change', function() {
        changeOrder(this.value)
    });
    $('#komp').on('change', function() {
        komp = this.value
        changeOrder(ordo)
    });
    $('#btn_top100').on('click', () => {
        changePlaylist('https://open.spotify.com/embed/user/dotevo/playlist/0eme5GZSMd9DlC84ETBZWU', 'top100.txt');
    });

});
