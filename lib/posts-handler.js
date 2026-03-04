'use strict';
const pug = require('pug');
const util = require('./handler-util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query']});

async function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      const posts = await prisma.post.findMany();
      res.end(pug.renderFile('./views/posts.pug', { posts }));
      break;
    case 'POST':
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      }).on('end', async() => {
        const params = new URLSearchParams(body);
        const content = params.get('content');
        console.info(`送信されました: ${content}`);
        //データベースにデータを保存する
        await prisma.post.create({
          data: {
            content,
            postedBy: req.user
          }
        })
        handleRedirectPosts(req, res);
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handle
};