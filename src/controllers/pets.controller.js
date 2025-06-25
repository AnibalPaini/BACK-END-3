import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/index.js";
import { TIPOS_ERROR } from "../utils/EErrores.js";

const getAllPets = async (req, res, next) => {
  try {
    const pets = await petsService.getAll();
    res.status(200).json({ status: "success", payload: pets });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const createPet = async (req, res, next) => {
  try {
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      CustomError.generaError(
        "Incomplete values",
        "Incomplete values",
        "Incomplete values",
        TIPOS_ERROR.FALTA_DE_DATOS
      );
    }

    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);

    res.status(201).json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const petUpdateBody = req.body;
    const petId = req.params.pid;
    const result = await petsService.update(petId, petUpdateBody);

    if (!result) {
      CustomError.generaError(
        `No pet found with ID ${petId}`,
        "No pet found with ID",
        "No pet found with ID",
        TIPOS_ERROR.NOT_FOUND
      );
    }

    res
      .status(200)
      .json({ status: "success", message: "Pet updated successfully" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = req.params.pid;
    const result = await petsService.delete(petId);

    if (!result) {
      CustomError.generaError(
        `No pet found with ID ${petId}`,
        "No pet found with ID",
        "No pet found with ID",
        TIPOS_ERROR.NOT_FOUND
      );
    }

    res
      .status(200)
      .json({ status: "success", message: "Pet deleted successfully" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const createPetWithImage = async (req, res, next) => {
  try {
    const file = req.file;
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate || !file) {
      CustomError.generaError(
        `Missing fields or image file`,
        "Missing fields or image file",
        "Missing fields or image file",
        TIPOS_ERROR.FALTA_DE_DATOS
      );
    }

    const pet = PetDTO.getPetInputFrom({
      name,
      specie,
      birthDate,
      image: `${__dirname}/../public/img/${file.filename}`,
    });

    const result = await petsService.create(pet);
    res.status(201).json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    next(error)
  }
};

export default {
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  createPetWithImage,
};
