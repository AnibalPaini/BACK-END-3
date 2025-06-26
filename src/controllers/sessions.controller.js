import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/User.dto.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/index.js";
import { TIPOS_ERROR } from "../utils/EErrores.js";

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password)
      CustomError.generaError(
        "Incomplete values",
        "Incomplete values",
        "Incomplete values",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    const exists = await usersService.getUserByEmail(email);
    if (exists)
      CustomError.generaError(
        "User already exists",
        "User already exists",
        "User already exists",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    const hashedPassword = await createHash(password);
    const user = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
    };
    let result = await usersService.create(user);
    req.logger.info(user);
    res.send({ status: "success", payload: result._id });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      CustomError.generaError(
        "Incomplete values",
        "Incomplete values",
        "Incomplete values",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    const user = await usersService.getUserByEmail(email);
    if (!user)
      CustomError.generaError(
        "User doesn't exist",
        "User doesn't exist",
        "User doesn't exist",
        TIPOS_ERROR.NOT_FOUND
      );
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword)
      CustomError.generaError(
        "Incorrect password",
        "Incorrect password",
        "Incorrect password",
        TIPOS_ERROR.AUTORIZACION
      );
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, "tokenSecretJWT", { expiresIn: "1h" });
    res
      .cookie("coderCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Logged in" });
  } catch (error) {
    req.logger.error(error);
    next(error)
  }
};

const current = async (req, res) => {
  const cookie = req.cookies["coderCookie"];
  const user = jwt.verify(cookie, "tokenSecretJWT");
  if (user) return res.send({ status: "success", payload: user });
};

const unprotectedLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmailLean(email);
    if (!user)
      return res
        .status(404)
        .send({ status: "error", error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword)
      return res
        .status(400)
        .send({ status: "error", error: "Incorrect password" });
    const token = jwt.sign(user, "tokenSecretJWT", { expiresIn: "1h" });
    res
      .cookie("unprotectedCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Unprotected Logged in" });
  } catch (error) {
    console.log(error);
    req.logger.error(error);
    next(error)
  }
};

const unprotectedCurrent = async (req, res, next) => {
  try {
    const cookie = req.cookies["unprotectedCookie"];
    const user = jwt.verify(cookie, "tokenSecretJWT");
    if (user) return res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error);
    next(error)
  }
};

export default {
  current,
  login,
  register,
  current,
  unprotectedLogin,
  unprotectedCurrent,
};
