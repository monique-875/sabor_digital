const pool = require("../config/database");

class UsuarioRepository {
  async create(usuarioData) {
    const { nome, email, senha, papel } = usuarioData;

    //Recebe um objeto com os dados do usuário e extrai (destructuring) os 4 campos que interessam.
    const [result] = await pool.query(
      "INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)",
      [nome, email, senha, papel || "cliente"],
    );
    return result.insertId;
  }

  //Busca um usuário pelo e-mail (usado no login, pra depois comparar a senha). rows[0] porque query sempre retorna um array — como e-mail é UNIQUE no banco, só pode ter 0 ou 1 resultado.
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT*FROM usuario WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id,nome,email,papel, criado_em FROM usuario WHERE id = ?",
      [id],
    );
    return rows[0];
  }
}

module.exports = new UsuarioRepository();
