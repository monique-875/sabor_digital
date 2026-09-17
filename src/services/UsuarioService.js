const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Biblioteca que cria (sign) e verifica (verify) tokens JWT
const UsuarioRepository = require('../repositories/UsuarioRepository');

// Chave secreta usada para "assinar" o token — vem do .env, nunca deve ficar hardcoded no código
const JWT_SECRET = process.env.JWT_SECRET;
// Tempo de validade do token (ex: "1d" = 1 dia). Depois disso o token expira e o usuário precisa logar de novo
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

class UsuarioService {
    async registrar(dados) {
        // (sem JWT aqui — só cria o usuário no banco com senha criptografada)
        const { nome, email, senha, papel } = dados;

        if (!nome || !email || !senha) {
            const erro = new Error('Nome, email e senha são obrigatórios.');
            erro.status = 400;
            throw erro;
        }

        const usuarioExistente = await UsuarioRepository.findByEmail(email);
        if (usuarioExistente) {
            const erro = new Error('Já existe um usuário cadastrado com este e-mail.');
            erro.status = 400;
            throw erro;
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const id = await UsuarioRepository.create({
            nome,
            email,
            senha: senhaHash,
            papel
        });

        return UsuarioRepository.findById(id);
    }

    async login(email, senha) {
        if (!email || !senha) {
            const erro = new Error('E-mail e senha são obrigatórios.');
            erro.status = 400;
            throw erro;
        }

        const usuario = await UsuarioRepository.findByEmail(email);
        if (!usuario) {
            const erro = new Error('E-mail ou senha inválidos.');
            erro.status = 401;
            throw erro;
        }

        // Compara a senha digitada com o hash salvo no banco (nunca comparamos senha em texto puro)
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            const erro = new Error('E-mail ou senha inválidos.');
            erro.status = 401;
            throw erro;
        }

        // ===== AQUI O JWT É CRIADO =====
        // jwt.sign(payload, chave_secreta, opções) gera uma string assinada digitalmente.
        // O "payload" é o que fica gravado dentro do token (id, email, papel do usuário).
        // Isso permite que, mais tarde, qualquer rota protegida saiba QUEM está fazendo a requisição
        // sem precisar consultar o banco de novo a cada requisição.
        // A JWT_SECRET garante que ninguém consiga forjar ou alterar esse token sem ser detectado.
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, papel: usuario.papel }, // payload (dados dentro do token)
            JWT_SECRET,        // chave secreta usada para assinar
            { expiresIn: JWT_EXPIRES_IN } // token expira automaticamente após esse tempo
        );

        // O token é devolvido pro front-end. A partir daqui, o front-end deve guardar esse token
        // (geralmente em localStorage/cookie) e enviá-lo em todas as próximas requisições autenticadas
        // dentro do header: Authorization: Bearer <token>
        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel
            }
        };
    }

    async buscarPorId(id) {
        // (sem JWT aqui — só busca no banco. Quem já garantiu que o usuário está autenticado
        // foi o middleware `autenticar`, que roda ANTES deste método ser chamado)
        const usuario = await UsuarioRepository.findById(id);
        if (!usuario) {
            const erro = new Error('Usuário não encontrado.');
            erro.status = 404;
            throw erro;
        }
        return usuario;
    }
}

module.exports = new UsuarioService();
