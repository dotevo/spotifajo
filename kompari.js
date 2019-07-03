var fs = require("fs");

var contents = fs.readFileSync("found.json");
var found = JSON.parse(contents);
contents = fs.readFileSync("data/plena_2019-04-25T08:05:06.765Z.json");
var plena = JSON.parse(contents);

let g = 0;
for(let i =0;i<found.tracks.length;i++) {
    let f = false;
    for(let j =0;j<plena.tracks.length;j++) {
        if(found.tracks[i].name == plena.tracks[j].name && found.tracks[i].album == plena.tracks[j].album ) {
            f = true
        }
    }
    if(f == false) {
        g += 1;
        console.log(g + ' ' + found.tracks[i].name + ' ' + found.tracks[i].album);
    }
}
