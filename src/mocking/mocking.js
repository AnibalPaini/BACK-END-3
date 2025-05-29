import { fakerES_MX as fa } from "@faker-js/faker";
import { createHash } from "../utils/index.js";

export const generarPet = () => {
  let name = fa.animal.petName();
  let specie = fa.animal.type();
  let birthDate = fa.date.birthdate();
  let adopted = false;
  let owner = null;
  let image = fa.image.avatar();

  return {
    name,
    specie,
    birthDate,
    adopted,
    owner,
    image,
  };
};

export const generarUser = async() => {
  const roles = ["user", "admin"];
  const index = Math.floor(Math.random() * roles.length);

  let first_name = fa.person.firstName();
  let last_name = fa.person.lastName();
  let email = fa.internet.email({ firstName: first_name, lastName: last_name });
  let password = await createHash("coder123");
  let role = roles[index];
  let pets = [];

  return {
    first_name,
    last_name,
    email,
    password,
    role,
    pets,
  };
};


