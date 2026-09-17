const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
    async registrar(req, res) {
        /*  #swagger.parameters['body'] = {
                in: 'body',
                description: 'Dados do novo usuário',
                schema: {
                    $nome: 'Administrador',
                    $email: 'admin@sabordigital.com',
                    $senha: '123456',
                    papel: 'admin'
                }
            }
        */
        try {
            const usuario = await UsuarioService.registrar(req.body);
            res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso',
                usuario
            });                                                                                                                                         

        } catch (erro) {
            res.status(erro.status || 500).json({ erro: erro.message || 'Erro interno do servidor' });
        }
    }

    async login(req, res) {
         /*  #swagger.parameters['body'] = {
                in: 'body',
                description: 'Credenciais de acesso',
                schema: {
                    $email: 'admin@sabordigital.com',
                    $senha: '123456'
                }
            }
        */
        try {
            const { email, senha } = req.body;
            const resultado = await UsuarioService.login(email, senha);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ erro: erro.message || 'Erro interno do servidor' });
        }
    }

    async me(req, res) {
        try {
            const usuario = await UsuarioService.buscarPorId(req.usuario.id);//req.usuario veio do token JWT
            res.status(200).json(usuario);
        } catch (erro) {
            res.status(erro.status || 500).json({ erro: erro.message || 'Erro interno do servidor' });
        }
    }
}

module.exports = new UsuarioController();
