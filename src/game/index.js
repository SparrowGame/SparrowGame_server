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
      module[game.name] = game;
      first = game;
      size++;
      console.log(`第 ${size} 游戏: ${game.name} - ${game.prompt}`);
    }catch (e){
      console.log(`无法载入游戏 ${gameName}`, e);
    }
  }
})

console.assert(size > 0, "在game文件夹中未找到游戏");
console.log(`在game文件夹中找到 ${size} 个游戏`);
console.log(`默认游戏为: ${first.name} - ${first.prompt}`);

export {
  module,
  first
}
