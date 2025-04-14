import { RequestHandler } from "express";


const auth: RequestHandler = (req, res, next) => {
    //Se não existir session user não autorizado
  if (!req.session.userData) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  next();
};

export default auth;
