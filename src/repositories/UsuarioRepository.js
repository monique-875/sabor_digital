const pool = require('../config/database');

class UsuarioRepository {
    async create(usuarioData) {
        const { nome, email, senha, papel } = usuarioData;
        const [result] = await pool.query(
            'INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
            [nome, email, senha, papel || 'cliente']
        );
        return result.insertId;
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT id, nome, email, papel, criado_em FROM usuario WHERE id = ?', [id]);
        return rows[0];
    }

       async findAll() {
         // Busca TODOS os usuários no banco, sem filtro
    // Não retorna a senha por segurança (só nome, email, papel, criado_em)
        const [rows] = await pool.query('SELECT id, nome, email, papel, criado_em FROM usuario');
        return rows;
    }

    async update(id, dados) {
            // Atualiza os dados de UM usuário específico, identificado pelo id
    // Não deixamos atualizar a senha aqui de propósito (isso seria outra rota, tipo "trocar senha")
        const { nome, email, papel } = dados;
        await pool.query(
            'UPDATE usuario SET nome = ?, email = ?, papel = ? WHERE id = ?',
            [nome, email, papel, id]
        );
    }

    async delete(id) {
          // Remove o usuário do banco permanentemente
        await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
    }
}




module.exports = new UsuarioRepository();
