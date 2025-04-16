import express from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis de ambiente

declare module "express-session" {
  interface SessionData {
    userData: {
      id: number;
      nome: string;
      email: string;
    };
  }
}

const app = express();

// ======= CORS CONFIGURAÇÃO =======
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Permite enviar cookies com requisições
}));

app.use(express.static("public")); // Serve arquivos estáticos da pasta public
// ======= MIDDLEWARES DE SEGURANÇA =======
app.use(helmet()); // Protege contra vulnerabilidades conhecidas
app.use(express.json()); // Para trabalhar com JSON no body
app.use(express.urlencoded({ extended: true })); // Para formularios

// ======= CONFIGURAÇÃO DE SESSÃO =======
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret", // Usar .env em produção
  name: "sessionId",
  resave: false,
  saveUninitialized: true, // Segurança: evita sessões sem dados
  cookie: {
    secure: process.env.NODE_ENV === "production", // Apenas HTTPS em produção
    httpOnly: true, // Impede acesso via JavaScript
    sameSite: "lax", // Protege contra CSRF
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
  }
}));

// ======= ROTAS =======
app.get("/", (_, res) => {
  res.redirect("/api");
});

app.use("/api", routes);

// ======= INICIALIZAÇÃO DO SERVIDOR =======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ API rodando em: http://localhost:${PORT}/api`);
});
