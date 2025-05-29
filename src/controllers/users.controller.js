import { usersService } from "../services/index.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/index.js";
import { TIPOS_ERROR } from "../utils/EErrores.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAll();
    res.send({ status: "success", payload: users });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: "error",
      message: "Error getAllUsers",
    });
  }
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user)
      CustomError.generaError(
        "User not found",
        "User not found",
        "User not found",
        TIPOS_ERROR.NOT_FOUND
      );
    res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user)
      CustomError.generaError(
        "User not found",
        "User not found",
        "User not found",
        TIPOS_ERROR.NOT_FOUND
      );
    const result = await usersService.update(userId, updateBody);
    res.send({ status: "success", message: "User updated" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.uid;
    const result = await usersService.getUserById(userId);
    res.send({ status: "success", message: "User deleted" });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: "error",
      message: "Error deleteUser",
    });
  }
};

export default {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
};
