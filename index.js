const config = require('./config.json');
const auth = require('spotify-personal-auth')
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

// Configure module
auth.config({
  port: 8888,
  clientId: config.client_id, // Replace with your client id
  clientSecret: config.client_secret, // Replace with your client secret
  scope: ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'], // Replace with your array of needed Spotify scopes
  path: 'tokens.json' // Optional path to file to save tokens (will be created for you)
})

const api = new SpotifyWebApi()

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

function getTracks(playlist, array, offset = 0) {
    console.log(`Download ${playlist} with offset ${offset}`);
    return api.getPlaylistTracks(playlist, {offset: offset}).then((data) => {
        array.push.apply(array, data.body.items);
        if(data.body.next != null) {
            return getTracks(playlist, array, offset + 100);
        }
    })
}

function getArtistString(track) {
    let str = '';
    for(let i = 0; i < track.artists.length; i++) {
        str += track.artists[i].name + ' ';
    }
    return str;
}


function clearPlaylist(config) {
    let p = [];
    return getTracks(config.to, p).then((data) => {
        let array = [];
        let i = 0;
        for(; i < p.length ; i++ ){
            let w = [];
            let j = 0;
            for(;j < 30 && i+j<p.length ; j++) {
                w.push({'uri': 'spotify:track:' + p[i+j].track.id});
            }
            i += j;
            array.push(w);
        }
        console.log("Total count: " + i);
        if (i == 0) {
            return Promise.resolve();
        }
        let promeses =[];
        for(let i =0; i< array.length;i++) {
            promeses.push(
                new Promise(resolve => setTimeout(resolve, 1000* i)).then(() => {
                    console.log("Removing ...")
                    console.log(array[i]);
                    return api.removeTracksFromPlaylist(config.to, array[i])
                }));
        }
        return Promise.all(promeses).then(()=>{
            return clearPlaylist(config);
        });
    });
}

function copyPlaylist(config) {
    let res = []
    return getTracks(config.from, res).then((p) => {
        console.log("Downloaded")
        // Sort
        console.log("Sorting")
        res.sort(function(a, b) {
          if (parseInt(a.track.popularity) < parseInt(b.track.popularity)) return 1;
          if (parseInt(a.track.popularity) > parseInt(b.track.popularity)) return -1;
          return 0;
        });

        // Creating list to add
        let added = 0;
        let albums = {};
        let artists = {};
        let toSaveSource = [];
        let toSaveDest = [];
        // For all songs from the list or to reach the limit
        for(var i = 0; i < res.length; i++) {
          toSaveSource.push(res[i].track.popularity+':'+getArtistString(res[i].track) + ':' + res[i].track.album.name + ':' + res[i].track.name);
          if(added >= config.limit_songs) continue;
          // Add to album var
          if(albums[res[i].track.album.id] == null) {
              albums[res[i].track.album.id] = 0;
          }
          // Limit per album
          if(config.limit_per_album == -1 || albums[res[i].track.album.id] < config.limit_per_album) {
              added++;
              albums[res[i].track.album.id]++;
              toSaveDest.push('spotify:track:' + res[i].track.id);
          }
        }

        fs.writeFile(config.save_dir +'/' + new Date().toISOString(), toSaveDest.join('\n'), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        fs.writeFile(config.save_dir +'/' + 'Source_' + new Date().toISOString(), toSaveSource.join('\n'), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        console.log(toSaveDest);
        return clearPlaylist(config).then(() => {
            console.log("All songs are removed");
            console.log("Total count to add: " + toSaveDest.length);
            // Split into smaller parts
            var arrays = [], size = 20;
            while (toSaveDest.length > 0)
                arrays.push(toSaveDest.splice(0, size));


            let promeses =[];
            for(let i =0; i< arrays.length;i++) {
                promeses.push(
                    new Promise(resolve => setTimeout(resolve, 1000* i)).then(() => {
                        console.log("Adding ...")
                        console.log(arrays[i]);
                        return api.addTracksToPlaylist(config.to, arrays[i])
                    }));
            }
            return Promise.all(promeses);
        })
    });
}

auth.token().then(([token, refresh]) => {
  // Sets api access and refresh token
  api.setAccessToken(token)
  api.setRefreshToken(refresh)
  console.log(refresh);

  // For each playlist
  for(let i = 0; i < config.playlists.length; i++) {
      copyPlaylist(config.playlists[i]).then(()=>{
          console.log("All songs are added");
      })
  }
})
