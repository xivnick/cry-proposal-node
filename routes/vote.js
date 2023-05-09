
const { Router } = require('express');
const router = Router();

const controller = require('../controllers/voteController');

router.post('/', controller.postVotes);
router.get('/sum', controller.getSumOfVoteNum);
router.get('/sum/used', controller.getSumOfVoteNumVotedToProposalId);

module.exports = router;