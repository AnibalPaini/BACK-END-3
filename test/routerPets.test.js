import { expect } from "chai";
import supertest from "supertest";
import { after, describe, it } from "mocha";
import mongoose, { isValidObjectId } from "mongoose";
import fs from "fs";

const requester = supertest("http://localhost:8080");

try {
  await mongoose.connect(
    "mongodb+srv://coder:coderpass@ecommerce-cluster0.7rqqj.mongodb.net/Mock?retryWrites=true&w=majority&appName=Ecommerce-Cluster0"
  );
} catch (error) {
  console.log(error);
}

describe("Prueba rutas mascotas", function () {
  this.timeout(10_000);

  describe("GET /api/pets", () => {
    it("Si ejecuto la ruta /api/pets, responde con un objeto con la propiedad 'status' con el valor 'success'", async () => {
      let { body } = await requester.get("/api/pets");
      expect(body).to.has.property("status").and.to.be.equal("success");
    });

    it("Si ejecuto la ruta /api/pets, debe devolver un status code 200", async () => {
      let { status } = await requester.get("/api/pets");
      expect(status).to.be.equal(200);
    });

    it("Si ejecuto la ruta /api/pets, debe devolver una propiedad payload que es un array y debe tener al menos un elemento", async () => {
      let { body } = await requester.get("/api/pets");
      expect(body.payload.length).to.be.greaterThan(0);
      expect(Array.isArray(body.payload)).to.be.equal(true);
    });
    it("Si ejecuto la ruta /api/pets, debe devolver un objeto con una propiedad 'payload' que es un array de objetos con las propiedades 'name', 'specie', 'birthDate' y 'owner'", async () => {
      let { body } = await requester.get("/api/pets");
      let propiedades = ["name", "specie", "birthDate", "owner"];
      for (let propiedad of propiedades) {
        expect(body.payload[0]).to.have.property(propiedad);
      }
    });
  });

  describe("POST /api/pets", () => {
    before(async () => {
      await mongoose.connection.collection("pets").deleteMany({ name: "test" });
    });

    after(async () => {
      await mongoose.connection.collection("pets").deleteMany({ name: "test" });
    });

    it("Si envio datos de una mascota válidos, a /api/pets, metodo POST, graba la mascta en DB", async () => {
      let petMock = {
        name: "test",
        specie: "dog",
        birthDate: "2019-02-12",
      };

      let { body } = await requester.post("/api/pets").send(petMock);

      expect(body).to.has.property("payload");
      expect(body).to.has.property("status").and.to.be.eq("success");
      expect(body.payload).to.has.property("name").and.to.be.eq(petMock.name);
      expect(body.payload)
        .to.has.property("specie")
        .and.to.be.eq(petMock.specie);
      expect(body.payload).to.has.property("_id");
      expect(isValidObjectId(body.payload._id)).to.be.true;
    });
    it("Si envio datos de una mascota invalidos, a /api/pets, metodo POST, el server responde con un status code 400", async () => {
      let petMock = {
        specie: "dog",
        birthDate: "2019-02-12",
      };

      let { statusCode } = await requester.post("/api/pets").send(petMock);

      expect(statusCode).to.be.eq(400);
    });

    it("Si ejecuto un post a /api/pets/withImage con una imagen, la sube al server", async () => {
      let petMock = {
        name: "test1",
        specie: "dog",
        birthDate: "2019-02-12",
      };

      let { body } = await requester
        .post("/api/pets/withImage")
        .field("name", petMock.name)
        .field("specie", petMock.specie)
        .field("birthDate", petMock.birthDate)
        .attach("image", "./src/public/img/1671549990926-coderDog.jpg");

      expect(body.payload._id).to.exist;
      expect(isValidObjectId(body.payload._id)).to.be.true;
      expect(body.payload.image).to.exist;
      expect(fs.existsSync(body.payload.image)).to.be.true;
      fs.unlinkSync(body.payload.image);
    });
  });

  describe("PUT /api/pets/:pid", () => {
    //Tomo la mascota creada en el test anterior para modificarla
    this.petId = null;
    before(async () => {
      let pet = await mongoose.connection
        .collection("pets")
        .findOne({ name: "test1" });
      this.petId = pet._id;
    });

    it("Si envio el ID por parametro deberia modificarlo en la base de datos y devolver un code 200, un status success y  message: 'Pet updated successfully'", async () => {
      // Modifico la mascota
      let petMock = {
        name: "test2",
      };
      let { body, statusCode } = await requester
        .put(`/api/pets/${this.petId}`)
        .send(petMock);

      expect(statusCode).to.be.eq(200);
      expect(body).to.has.property("status").and.to.be.eq("success");
      expect(body)
        .to.has.property("message")
        .and.to.be.eq("Pet updated successfully");
    });

    it("En caso de enviar un ID no valido debe darme un code 404 y un error 'No pet found with ID'", async () => {
      // Modifico la mascota
      const fakeId = new mongoose.Types.ObjectId();
      console.log(fakeId);
      let petMock = {
        name: "test2",
      };
      let { body, statusCode } = await requester
        .put(`/api/pets/${fakeId}`)
        .send(petMock);

      expect(statusCode).to.be.eq(404);
      expect(body)
        .to.has.property("error")
        .and.to.be.eq("No pet found with ID");
    });
  });

  describe("DELETE /api/pets/:pid", () => {
    //Tomo la mascota creada en el test anterior para borrarla
    this.petId = null;
    before(async () => {
      let pet = await mongoose.connection
        .collection("pets")
        .findOne({ name: "test2" });
      this.petId = pet._id;
    });

    //En caso de que no se haya borrado la mascota de prueba, la borro
    after(async () => {
      await mongoose.connection
        .collection("pets")
        .deleteMany({ name: "test2" });
    });

    it("Si envio el ID por parametro deberia eliminarlo de la base de datos y devolver un code 200, un status success y  message: 'Pet deleted successfully'", async () => {
      let { body, statusCode } = await requester.delete(
        `/api/pets/${this.petId}`
      );

      expect(statusCode).to.be.eq(200);
      expect(body).to.has.property("status").and.to.be.eq("success");
      expect(body)
        .to.has.property("message")
        .and.to.be.eq("Pet deleted successfully");
    });

    it("En caso de enviar un ID no valido debe darme un code 404 y un error 'No pet found with ID'", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      let { body, statusCode } = await requester.delete(`/api/pets/${fakeId}`);

      expect(statusCode).to.be.eq(404);
      expect(body)
        .to.has.property("error")
        .and.to.be.eq("No pet found with ID");
    });
  });
});
