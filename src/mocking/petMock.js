import { fakerES_MX as fa } from "@faker-js/faker";

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
console.log(generarPet());

