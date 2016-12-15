'use strict';
// 使用 Bluebird Promise 库
global.Promise = require('bluebird');
global.ROOT = __dirname;
global.isProduction = (process.env.NODE_ENV === 'production');
global.isClient = (!!process.env.CLIENT);
global.isDEBUG = (!!process.env.DEBUG);
