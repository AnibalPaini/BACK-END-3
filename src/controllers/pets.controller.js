import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";
import { logger } from "../utils/index.js";

const getAllPets = async (req, res) => {
  try {
    const pets = await petsService.getAll();
    res.status(200).json({ status: "success", payload: pets });
  } catch (error) {
    req.logger.error(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Error fetching pets",
        detail: error.message,
      });
  }
};

const createPet = async (req, res) => {
  try {
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Missing required fields: name, specie, or birthDate",
        });
    }

    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);

    res.status(201).json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Error creating pet",
        detail: error.message,
      });
  }
};

const updatePet = async (req, res) => {
  try {
    const petUpdateBody = req.body;
    const petId = req.params.pid;
    const result = await petsService.update(petId, petUpdateBody);

    if (!result) {
      return res
        .status(404)
        .json({ status: "error", message: `No pet found with ID ${petId}` });
    }

    res
      .status(200)
      .json({ status: "success", message: "Pet updated successfully" });
  } catch (error) {
    req.logger.fatal(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Error updating pet",
        detail: error.message,
      });
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = req.params.pid;
    const result = await petsService.delete(petId);

    if (!result) {
      return res
        .status(404)
        .json({ status: "error", message: `No pet found with ID ${petId}` });
    }

    res
      .status(200)
      .json({ status: "success", message: "Pet deleted successfully" });
  } catch (error) {
    req.logger.fatal(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Error deleting pet",
        detail: error.message,
      });
  }
};

const createPetWithImage = async (req, res) => {
  try {
    const file = req.file;
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate || !file) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing fields or image file" });
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
    req.logger.fatal(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Error creating pet with image",
        detail: error.message,
      });
  }
};


export default {
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  createPetWithImage,
};
