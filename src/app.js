import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { logger, middLogg, errorHandler } from "./utils/index.js";
import { TIPOS_ERROR } from "./utils/EErrores.js";

import { CustomError } from "./utils/CustomError.js";
import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";

/* process.loadEnvFile("./src/.env"); */
const PORT = process.env.PORT || 8080;

const app = express();
const connection = mongoose.connect(
  `mongodb+srv://coder:coderpass@ecommerce-cluster0.7rqqj.mongodb.net/Mock?retryWrites=true&w=majority&appName=Ecommerce-Cluster0`
);

app.use(express.json());
app.use(cookieParser());

app.use(middLogg);
app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);

app.use(`/loggerTest`, (req, res) => {
  req.logger.fatal("Esto es un error fatal");
  req.logger.error("Esto es un error");
  req.logger.warning("Esto es un warning");
  req.logger.info("Esto es info");
  req.logger.http("Esto es una peticion http");
  req.logger.debug("Esto es debug");

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ payload: "Logs ejecutados" });
});

app.use(`/testErrorHandler`, (req, res, next) => {
  try {
    let { errorTest } = req.query;
    if (!errorTest) {
      CustomError.generaError(
        "Error ruta /testErrorHandler",
        "Arrgumentos incorrectos",
        "Testeo de error",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }
  } catch (error) {
    req.logger.fatal("Test de error: " + error);
    next(error);
  }
});

app.use(errorHandler)

app.listen(PORT, () => logger.info(`http://localhost:${PORT}`));
