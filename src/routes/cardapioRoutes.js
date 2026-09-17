const express = require('express');
const router = express.Router();
const CardapioController = require('../controllers/CardapioController');
const { autenticar, autorizar } = require('../middlewares/authmedware');

router.get('/', CardapioController.listar);
router.get('/:id', CardapioController.buscarPorId);
// router.post('/', CardapioController.cadastrar);
// router.delete('/:id', CardapioController.deletar);

router.post('/', autenticar, autorizar('admin'), CardapioController.cadastrar);
router.delete('/:id', autenticar, autorizar('admin'), CardapioController.deletar);
 

module.exports = router;
