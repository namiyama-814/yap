'use strict';
const postsHandler = require('./posts-handler');
const util = require('./handler-util');

function route(req, res) {
  switch (req.url) {
    case '/' || '':
      util.handleRedirect(req, res);
    break;
    case '/posts':
      postsHandler.handle(req, res);
      break;
    case '/posts/delete':
      postsHandler.handleDelete(req, res)
      break;
    case '/logout':
      util.handleLogout(req, res);
      break;
    case '/favicon.ico':
      util.handleFavicon(req, res);
    break;
    case '/style.css':
      util.handleStyle(req, res);
    break;
    default:
      util.handleNotFound(req, res);
      break;
    case '/yap.js':
      util.handleJs(req, res)
    break;
    case '/changeTheme':
      util.handleChangeTheme(req, res)
    break;
  }
}

module.exports = {
  route
};