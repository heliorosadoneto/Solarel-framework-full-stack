import pool from "../config/db";

interface User {
  email: string;
  senha: string;
}

class UserModel {
  public async userVerifica(email:string, senha:string): Promise<User[] | null> {
    try {
      const { rows } = await pool.query(
        "SELECT email, senha FROM dbuser WHERE email = $1 AND senha = $2",
        [email, senha]
      );
      if (rows.length > 0) return rows;
      return null;
    } catch {
      console.log("Erro ao verificar usuário");
      return null;
    }
  }}

export default new UserModel();
