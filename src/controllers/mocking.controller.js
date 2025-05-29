import { petsService, usersService } from "../services/index.js";
import { generarPet, generarUser } from "../mocking/mocking.js";

const postMocksPets = async (req, res) => {
  try {
    let { cantidad = 100, db } = req.query;
    cantidad = parseInt(cantidad);

    if (isNaN(cantidad) || cantidad <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid 'cantidad' value" });
    }

    let pets = [];

    for (let i = 0; i < cantidad; i++) {
      pets.push(generarPet());
    }

    if (db) {
      pets = await petsService.create(pets);
    }

    res.status(200).json({ status: "success", pets });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error generating mock pets",
      detail: error.message,
    });
  }
};

const postMocksUser = async (req, res) => {
  try {
    let { cantidad = 50, db } = req.query;
    cantidad = parseInt(cantidad);

    if (isNaN(cantidad) || cantidad <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid 'cantidad' value" });
    }

    let users = [];

    for (let i = 0; i < cantidad; i++) {
        users.push(await generarUser());
    }

    if (db) {
      users = await usersService.create(users);
    }

    res.status(200).json({ status: "success", users });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error generating mock pets",
      detail: error.message,
    });
  }
};

export default {
  postMocksPets,
  postMocksUser,
};
