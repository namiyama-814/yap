'use strict';
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handler-util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
const { currentThemeKey } = require('../config');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/ja');
dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault('Asia/Tokyo');

const crypto = require('node:crypto');
const OneTimeTokenMap = new Map(); // キーをユーザー値をトークンとする連想配列

async function handle(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = cookies.get(currentThemeKey) || 'light';
  const options = { maxAge: 1000 * 60 * 60 * 24 * 30 };
  cookies.set(currentThemeKey, currentTheme, options);
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      const posts = await prisma.post.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      posts.forEach(post => {
        post.relativeCreatedAt = dayjs(post.createdAt).tz().fromNow();
        post.absoluteCreatedAt = dayjs(post.createdAt).tz().format('YYYY年MM月DD日 HH時mm分ss秒');
      });

      const oneTimeToken = crypto.randomBytes(8).toString('hex');
      OneTimeTokenMap.set(req.user, oneTimeToken);
      res.end(pug.renderFile('./views/posts.pug', { currentTheme, posts, user: req.user, oneTimeToken }));
      console.info(
        `閲覧されました：user = ${req.user}`,
      )

      break;
    case 'POST':
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      }).on('end', async () => {
        const params = new URLSearchParams(body);
        const content = params.get('content');
        const requestedOneTimeToken = params.get('oneTimeToken');
        if (!content) {
          handleRedirectPosts(req, res);
          return;
        }
        if (!requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }
        if (OneTimeTokenMap.get(req.user) !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }
        console.info(`送信されました: ${content}`);
        //データベースにデータを保存する
        await prisma.post.create({
          data: {
            content,
            postedBy: req.user
          }
        });
        OneTimeTokenMap.delete(req.user);
        handleRedirectPosts(req, res);
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      }).on('end', async () => {
        const params = new URLSearchParams(body);
        const id = parseInt(params.get('id'));
        const requestedOneTimeToken = params.get('oneTimeToken');
        if (!id) {
          util.handleBadRequest(req, res);
          return;
        }
        if (!requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }
        if (OneTimeTokenMap.get(req.user) !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }
        const post = await prisma.post.findUnique({
          where: { id }
        });
        if (req.user === post.postedBy || req.user === 'admin') {
          await prisma.post.delete({
            where: { id }
          });
          handleRedirectPosts(req, res)
        }
        console.info(`次のメッセージが${req.user}によって削除されました：${post.content}`);
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
  handle,
  handleDelete,
};