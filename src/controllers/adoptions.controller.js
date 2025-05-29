import {
  adoptionsService,
  petsService,
  usersService,
} from "../services/index.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/index.js";
import { TIPOS_ERROR } from "../utils/EErrores.js";

const getAllAdoptions = async (req, res) => {
  try {
    const result = await adoptionsService.getAll();
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.fatal(error);
    res.status(500).send({
      status: "error",
      error: "Error getAllAdoptions",
    });
  }
};

const getAdoption = async (req, res, next) => {
  try {
    const adoptionId = req.params.aid;
    const adoption = await adoptionsService.getBy({ _id: adoptionId });
    if (!adoption) {
      CustomError.generaError(
        "Adoption not found",
        "Adoption not found",
        "Adoption not found",
        TIPOS_ERROR.NOT_FOUND
      );
    }
    res.send({ status: "success", payload: adoption });
  } catch (error) {
    req.logger.fatal(error);
    next(error);
  }
};

const createAdoption = async (req, res, next) => {
  try {
    const { uid, pid } = req.params;
    const user = await usersService.getUserById(uid);
    if (!user) {
      CustomError.generaError(
        "User not found",
        "User not found",
        "User not found",
        TIPOS_ERROR.NOT_FOUND
      );
    }

    const pet = await petsService.getBy({ _id: pid });
    if (!pet)
      CustomError.generaError(
        "Pet not found",
        "Pet not found",
        "Pet not found",
        TIPOS_ERROR.NOT_FOUND
      );

    if (pet.adopted)
      CustomError.generaError(
        "Pet is already adopted",
        "Pet is already adopted",
        "Pet is already adopted",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );

    user.pets.push(pet._id);
    await usersService.update(user._id, { pets: user.pets });
    await petsService.update(pet._id, { adopted: true, owner: user._id });
    await adoptionsService.create({ owner: user._id, pet: pet._id });

    res.send({ status: "success", message: "Pet adopted" });
  } catch (error) {
    req.logger.fatal(error);
    next(error);
  }
};

export default {
  createAdoption,
  getAllAdoptions,
  getAdoption,
};
