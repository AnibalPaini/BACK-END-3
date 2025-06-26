import { expect } from "chai";
import supertest from "supertest";
import { describe, it } from "mocha";

import mongoose from "mongoose";

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

  /*     before(async()=>{
        //   await mongoose.connection.dropDatabase();
    }) */
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
    it("Si envio datos de una mascota válidos, a /api/pets, metodo POST, graba la mascta en DB", async () => {
      let petMock = {
        name: "Marshall",
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
  });
});
