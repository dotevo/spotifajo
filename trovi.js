const config = require('./config.json');
const auth = require('spotify-personal-auth')
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

const api = new SpotifyWebApi()
// Configure module
auth.config({
  port: 8888,
  clientId: config.client_id, // Replace with your client id
  clientSecret: config.client_secret, // Replace with your client secret
  scope: ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'], // Replace with your array of needed Spotify scopes
  path: 'tokens.json' // Optional path to file to save tokens (will be created for you)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

function findTracks(query, array, offset = 0) {
    console.log(`Download ${query} with offset ${offset}`);
    return api.searchTracks(query, {offset: offset}).then((data) => {
        console.log(data)
        array.push.apply(array, data.body.tracks.items);
        if(data.body.tracks.next != null) {
            return findTracks(query, array, offset + 20);
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

auth.token().then(([token, refresh]) => {
  // Sets api access and refresh token
  api.setAccessToken(token)
  api.setRefreshToken(refresh)
  console.log(refresh);

  let array = [];
  findTracks('genre:esperanto',array).then(()=>{
        console.log(array);
        let p = [];
        for(var i = 0; i < array.length; i++) {
          p.push({popularity: array[i].popularity, artist:getArtistString(array[i]), album:array[i].album.name, name:array[i].name});
        }

        fs.writeFile('found.json', JSON.stringify({tracks:p}), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
  })
})
