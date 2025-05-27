import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import { dirname } from "path";
import winston from "winston";

export const createHash = async (password) => {
  const salts = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salts);
};

export const passwordValidation = async (user, password) =>
  bcrypt.compare(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

//Logger
const mode = "dev";

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "redBG",
    error: "red",
    warning: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
  },
};
winston.addColors(customLevels.colors);

export const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new winston.transports.Console({
      level: mode === "dev" ? "debug" : "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "error",
      filename: "./src/logs/error.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

//Middleware para utilizar logger en todas las rutas
export const middLogg = (req, res, next) => {
  req.logger = logger;

  next();
};

//Middleware para ErrorHandler
export const errorHandler = (error, req, res, next) => {
  res.setHeader("Content-Type", "application/json");

  if (error.custom) {
    req.logger.fatal(error.message); 
    return res.status(error.code || 400).json({ error: error.message });
  } else {
    req.logger.fatal(error); 
    return res.status(500).json({ error: "Error inesperado" });
  }
};


