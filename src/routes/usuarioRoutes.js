const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { autenticar } = require('../middlewares/authmedware');

// Rota pública — não precisa de token, qualquer um pode se cadastrar
router.post('/registrar', UsuarioController.registrar);

// Rota pública — é aqui que o JWT é GERADO (dentro de UsuarioService.login).
// O usuário manda email/senha e recebe um token de volta.
router.post('/login', UsuarioController.login);

// Rota PROTEGIDA — o middleware `autenticar` é executado ANTES do controller `me`.
// Ele exige que o header "Authorization: Bearer <token>" venha na requisição.
// Se o token for válido, req.usuario é preenchido e o controller consegue
// usar req.usuario.id para saber de qual usuário buscar os dados.
router.get('/me', autenticar, UsuarioController.me);

module.exports = router;