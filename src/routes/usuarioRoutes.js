const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');
// Importa os "porteiros" que já existiam no projeto (não criei middleware novo)

router.get('/', verificarToken, verificarAdmin, UsuarioController.listar);
// Só ADMIN logado pode ver a lista de todos os usuários (dado sensível)

router.get('/:id', verificarToken, UsuarioController.buscarPorId);
// Qualquer usuário LOGADO pode ver um usuário específico (ex: seu próprio perfil)

router.put('/:id', verificarToken, UsuarioController.atualizar);
// Qualquer usuário LOGADO pode editar (dá pra restringir mais depois, tipo "só pode editar a si mesmo")

router.delete('/:id', verificarToken, verificarAdmin, UsuarioController.deletar);
// Só ADMIN pode deletar um usuário

module.exports = router;