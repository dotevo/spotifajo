const config = require('./config.json');
const auth = require('spotify-personal-auth')
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const spotifajo = require('./spotifajo')

const TARGET_PLAYLIST = '6vDScQStLTZERoWEEOvCn3';
const SOURCE_PLAYLIST = '7LYL5Mcc2oEBphWrKujpq3';
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

auth.token().then(([token, refresh]) => {
  // Sets api access and refresh token
  api.setAccessToken(token)
  api.setRefreshToken(refresh)
  console.log(refresh);

  let res = [];
  spotifajo.getTracks(api, SOURCE_PLAYLIST, res).then(()=> {
    console.log(res.length)
    res = res.filter(el => el.track.album.release_date.search('2018') > -1)
  }).then(() => {
    console.log("Trovitaj: " + res.length)

    let tracks = res.map(el => 'spotify:track:' + el.track.id)

    // Split into smaller parts
    var arrays = [], size = 20;
    while (tracks.length > 0)
      arrays.push(tracks.splice(0, size));

    // Add
    let promeses =[];
    for(let i =0; i< arrays.length;i++) {
        promeses.push(
            new Promise(resolve => setTimeout(resolve, 1000* i)).then(() => {
                console.log("Adding ...")
                console.log(arrays[i]);
                return api.addTracksToPlaylist(TARGET_PLAYLIST, arrays[i])
            }));
    }
    return Promise.all(promeses);
  })
})
