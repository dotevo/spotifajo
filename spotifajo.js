
function getTracks(api, playlist, array, offset = 0) {
    console.log(`Download ${playlist} with offset ${offset}`);
    return api.getPlaylistTracks(playlist, {offset: offset}).then((data) => {
        array.push.apply(array, data.body.items);
        if(data.body.next != null) {
            return getTracks(api, playlist, array, offset + 100);
        }
    })
}


exports.getTracks = getTracks;