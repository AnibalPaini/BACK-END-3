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

describe("Prueba rutas adoption", function () {
  this.timeout(10_000);

  describe("GET /api/adoptions", () => {
    it("Si ejecuto la ruta /api/adoptions, responde con un objeto con la propiedad 'status' con el valor 'success'", async () => {
      let { body } = await requester.get("/api/adoptions");
      expect(body).to.has.property("status").and.to.be.equal("success");
    });
    it("Si ejecuto la ruta /api/adoptions, debe devolver un arreglo y tener al menos un elemento", async () => {
      let { body } = await requester.get("/api/adoptions");
      expect(Array.isArray(body.payload)).to.be.equal(true);
      expect(body.payload.length).to.be.greaterThan(0);
    });
    it("Si ejecuto la ruta /api/adoptions, la respuesta debe tener un arreglo con las propiedades 'owner' y 'pet'", async () => {
      let { body } = await requester.get("/api/adoptions");
      expect(body.payload[0]).to.have.property("owner");
      expect(body.payload[0]).to.have.property("pet");
      this.adoptionID = body.payload[0]._id;
    });
  });

  describe("GET /api/adoptions/:aid", () => {
    it("Si ejecuto la ruta /api/adoptions/:aid, responde con un objeto con la propiedad 'status' con el valor 'success'", async () => {
      let { body } = await requester.get(`/api/adoptions/${this.adoptionID}`);
      expect(body).to.has.property("status").and.to.be.equal("success");
    });

    it("Si ejecuto la ruta /api/adoptions/:aid, debe devolver un status code 200", async () => {
      let { status } = await requester.get(`/api/adoptions/${this.adoptionID}`);
      expect(status).to.be.equal(200);
    });

    it("Si ejecuto la ruta /api/adoptions/:aid, debe devolver una propiedad payload que es un objeto con las propiedades 'owner' y 'pet'", async () => {
      let { body } = await requester.get(`/api/adoptions/${this.adoptionID}`);
      expect(body.payload).to.have.property("owner");
      expect(body.payload).to.have.property("pet");
    });
  });

  describe("POST /api/adoptions/:uid/:pid", function () {
    before(async function () {
      this.userId = "685c1b21484ea2dd2e221191";
      this.petId = "6834d53168e86677dcbe5f4b";
    
      await mongoose.connection.collection("adoptions").deleteMany({
        owner: new mongoose.Types.ObjectId(this.userId)
      });
      await mongoose.connection
        .collection("pets")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(this.petId) },
          { $set: { adopted: false, owner: null } }
        );
    });
    

    after(async () => {
      console.log("Eliminando adopciones y actualizando mascota");
      await mongoose.connection.collection("adoptions").deleteMany({
        owner: new mongoose.Types.ObjectId(this.userId)
      });
      await mongoose.connection
        .collection("pets")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(this.petId) },
          { $set: { adopted: false, owner: null } }
        );
    });

    it("Si envio datos válidos a /api/adoptions/:uid/:pid, graba la adopción en DB", async function () {
      const { body } = await requester.post(
        `/api/adoptions/${this.userId}/${this.petId}`
      );
      expect(body).to.have.property("status").and.to.equal("success");
      expect(body).to.have.property("message").and.to.equal("Pet adopted");
    });

    it("Si envio datos inválidos a /api/adoptions/:uid/:pid, el server responde con un status code 404", async function () {
      const userId = new mongoose.Types.ObjectId();
      const petId = new mongoose.Types.ObjectId();
      const { status } = await requester.post(
        `/api/adoptions/${userId}/${petId}`
      );
      expect(status).to.equal(404);
    });

    it("Si envio una mascota ya adoptada a /api/adoptions/:uid/:pid, el server responde con un status code 400", async function () {
      const { body, statusCode } = await requester.post(
        `/api/adoptions/${this.userId}/${this.petId}`
      );
      expect(body).to.have.property("error").and.to.equal("Pet is already adopted");
      expect(statusCode).to.equal(400);
    });
  });
});
