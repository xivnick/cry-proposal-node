
const { Router } = require('express');
const router = Router();

const controller = require('../controllers/proposalController');

router.get('/list', controller.getProposalList);
router.get('/', controller.getProposal);
router.post('/', controller.postProposal);

module.exports = router;