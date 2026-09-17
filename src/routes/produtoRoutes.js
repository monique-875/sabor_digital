const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const upload = require('../config/multer');
const { autenticar, autorizar } = require('../middlewares/authmedware');

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);

router.post('/', autenticar, autorizar('admin'), upload.single('imagem'), ProdutoController.cadastrar);
router.put('/:id', autenticar, autorizar('admin'), upload.single('imagem'), ProdutoController.atualizar);
router.delete('/:id', autenticar, autorizar('admin'), ProdutoController.deletar);

module.exports = router;