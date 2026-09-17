const jwt = require('jsonwebtoken');

// Verifica se o token JWT enviado no header Authorization é válido

//OBS - Toda requisição autenticada precisa mandar um header Authorization. Se não vier nenhum, barra na hora com 401

function autenticar(req, res, next) {//Onde o token é verificado
    const authHeader = req.headers.authorization;

    if (!authHeader) {//Busca o token
        return res.status(401).json({ erro: 'Token não informado.' });
    }

    const partes = authHeader.split(' ');// se alguem não mandou token barra na hora ele faz a autentificacção do token
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Token mal formatado.' });
    }

    const token = partes[1];

//onfere se a assinatura bate com a JWT_SECRET (ou seja, se o token não foi forjado/alterado) e se ele não expirou. Se algo estiver errado → 403 (Forbidden). Se estiver tudo certo, o payload (aquele {id, email, papel} que foi colocado no jwt.sign) é anexado em req.usuario, e next() deixa a requisição seguir pro controller.

    jwt.verify(token, process.env.JWT_SECRET, (erro, payload) => {
        if (erro) {
            return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        }
        req.usuario = payload; // { id, email, papel }
        next();
    });
}

// Restringe a rota a determinados papéis (ex: autorizar('admin'))

function autorizar(...papeisPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !papeisPermitidos.includes(req.usuario.papel)) {
            return res.status(403).json({ erro: 'Você não tem permissão para acessar este recurso.' });
        }
        next();
    };
}

module.exports = { autenticar, autorizar };