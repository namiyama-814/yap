'use strict';
const pug = require('pug');
const fs  = require('node:fs');

const Cookies = require('cookies');
const { currentThemeKey } = require('../config');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/restart.pug'));
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/404.pug'));
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon)
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストなのだ！')
}

function handleRedirect(req, res) {
  res.writeHead(302, {
    Location: '/posts'
  });
  res.end();
};

function handleStyle(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./public/style.css');
  res.end(file);
}

function handleJs(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
  });
  const file = fs.readFileSync('./public/yap.js');
  res.end(file);
};

function handleChangeTheme(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = (cookies.get(currentThemeKey) !== 'light' ? 'light' : 'dark');
  cookies.set(currentThemeKey, currentTheme);
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handleLogout,
  handleNotFound,
  handleBadRequest,
  handleFavicon,
  handleRedirect,
  handleStyle,
  handleJs,
  handleChangeTheme,
};