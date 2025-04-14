import { Router } from "express";
import LoginController from "../controllers/LoginController";
import auth from "../auth/authUser";

const router = Router();

// Rota de login (pública)
router.post("/login", LoginController.login);
router.post("/register", LoginController.register);
router.post("/logout", LoginController.logout);


// Rotas protegidas
router.get("/profile", auth, LoginController.profile);

export default router;
