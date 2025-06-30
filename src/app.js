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
import mockingRouter from "./routes/mocking.router.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

const PORT = process.env.PORT || 8080;

const app = express();
const connection = mongoose.connect(
  process.env.MONGO_URI
);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ABM Users Documentation",
      version: "1.0.0",
      description: "ABM Users Documentation - Swagger Test",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
  },
  apis: ["./src/docs/*.yaml"],
}
const spec = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(spec));

app.use(express.json());
app.use(cookieParser());

app.use(middLogg);
app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocks", mockingRouter);

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
      throw CustomError.generaError(
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
