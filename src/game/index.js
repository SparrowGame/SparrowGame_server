'use strict';

const glob = require('glob');
const fs = require('fs');
const path = require('path');

let module = {};
let first = null;
let size = 0;

var files = glob.sync(`${__dirname}/*`)
files.forEach((file) => {
  if (fs.lstatSync(file).isDirectory()){
    let gameName = path.basename(file);
    try{
      let game = require(file);
      module[gameName] = game;
      first = game;
      size++;
    }catch (e){
      console.log(`Can't read game names ${gameName}`, e);
    }
  }
})

console.assert(size > 0, "Not found any game in game folder");
console.log(`Found ${size} games in game folder`);

export {
  module,
  first
}
