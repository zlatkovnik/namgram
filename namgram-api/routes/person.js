const path = require('path');

const express = require('express');

const personController = require('../controllers/person');

const router = express.Router();

//naci najaktivnijeg usera(koji je najvise lajkovao, omentarisao)

//MATCH (u:User)
// OPTIONAL MATCH (u)-[:AUTHORED|ASKED|COMMENTED]->()
// RETURN u,count(*)
// ORDER BY count(*) DESC
// LIMIT 5
router.get('/all', personController.getAll);
router.get('/byEmail/:email', personController.getByEmail);
router.get('/byUsername', personController.getByUsername);
router.get('/getFollowing', personController.getFollowing);
router.get('/getFollowers', personController.getFollowers);
router.post('/follow', personController.follow);
router.delete('/unfollow', personController.unfollow);
router.delete('/delete', personController.deletePerson);

module.exports = router;