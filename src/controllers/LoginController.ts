import { Request, Response } from "express";
import { z } from "zod";
import pool from "../config/db";
import bcrypt from "bcrypt";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

class LoginController {
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.flatten().fieldErrors });
        return;
      }

      const { email, senha } = result.data;

      const { rows } = await pool.query(
        "SELECT id, nome, email, senha FROM dbuser WHERE email = $1",
        [email]
      );

      if (rows.length === 0) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
      }

      const usuario = rows[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
      }

      req.session.userData = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      };

      res.status(200).json({
        message: "Login realizado com sucesso",
        user: req.session.userData,
      });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.flatten().fieldErrors });
        return;
      }

      const { nome, email, senha } = result.data;

      const existingUser = await pool.query(
        "SELECT id FROM dbuser WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: "Email já cadastrado" });
        return;
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      const query = `
        INSERT INTO dbuser (nome, email, senha)
        VALUES ($1, $2, $3)
        RETURNING id, nome, email
      `;
      const values = [nome, email, hashedPassword];
      const { rows } = await pool.query(query, values);

      res.status(201).json({
        message: "Registro realizado com sucesso",
        user: rows[0],
      });
    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const dados = req.session.userData;
    if (!dados?.id) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const { rows } = await pool.query("SELECT * FROM dbuser WHERE id = $1", [
      dados.id,
    ]);

    if (rows.length > 0) {
      res.status(200).json({
        message: "Perfil do usuário",
        user: {
          id: rows[0].id,
          nome: rows[0].nome,
          email: rows[0].email,

        },
      });
    } else {
      res.status(401).json({ error: "Usuário não encontrado" });
    }
  }

  public logout(req: Request, res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        res.status(500).json({ error: "Erro ao fazer logout" });
      } else {
        res.status(200).json({ message: "Logout realizado com sucesso" });
      }
    });
  }
}

export default new LoginController();
