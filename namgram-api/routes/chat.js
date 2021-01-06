const path = require('path');

const express = require('express');

const chatController = require('../controllers/chat');

const router = express.Router();

router.get('/getMessages', chatController.getMessages);
router.post('/join', chatController.joinChat);
router.post('/leave', chatController.leaveChat);
router.post('/send', chatController.sendMessage);

module.exports = router;