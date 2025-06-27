import { expect } from "chai";
import supertest from "supertest";
import { after, describe, it } from "mocha";
import mongoose from "mongoose";

const requester = supertest("http://localhost:8080");

try {
  await mongoose.connect(
    "mongodb+srv://coder:coderpass@ecommerce-cluster0.7rqqj.mongodb.net/Mock?retryWrites=true&w=majority&appName=Ecommerce-Cluster0"
  );
} catch (error) {
  console.log(error);
}

describe("Pruba rutas usuarios /api/users", function () {
  this.timeout(10_000);
  before(async () => {
    //Creo un usuario de prueba
    await mongoose.connection.collection("users").insertOne({
      first_name: "UpdatedName",
      last_name: "Test",
      email: "updated@example.com",
      password: "updated123",
      role: "user",
      pets: [],
    });
    this.userId = await mongoose.connection
      .collection("users")
      .findOne({ first_name: "UpdatedName" })
      .then((user) => user._id.toString());
  });

  after(async () => {
    //En caso de que no se haya eliminado el usuario de prueba, lo elimino
    await mongoose.connection
      .collection("users")
      .deleteMany({ email: "updated@example.com" });
  });

  describe("GET /api/users", () => {
    it("Si ejecuto la ruta /api/users, responde con un objeto con la propiedad 'status' con el valor 'success'", async () => {
      let { body } = await requester.get("/api/users");
      expect(body).to.has.property("status").and.to.be.equal("success");
    });

    it("Si ejecuto la ruta /api/users, debe devolver un status code 200", async () => {
      let { status } = await requester.get("/api/users");
      expect(status).to.be.equal(200);
    });

    it("Si ejecuto la ruta /api/users, debe devolver una propiedad payload que es un array y debe tener al menos un elemento", async () => {
      let { body } = await requester.get("/api/users");
      expect(body.payload.length).to.be.greaterThan(0);
      expect(Array.isArray(body.payload)).to.be.equal(true);
    });
  });

  describe("GET /api/users/:uid", () => {
    it("Si ejecuto la ruta /api/users/:uid, debe devolver un objeto con una propiedad 'status' que es 'success' y code 200", async () => {
      let { body, statusCode } = await requester.get(
        `/api/users/${this.userId}`
      );
      expect(body).to.has.property("status").and.to.be.equal("success");
      expect(statusCode).to.be.eq(200);
    });

    it("Si ejecuto la ruta /api/users/:uid, debe devolver un objeto", async () => {
      let { body } = await requester.get(`/api/users/${this.userId}`);
      expect(body.payload).to.be.an("object");
    });

    it("Si ejecuto la ruta /api/users/:uid, debe devolver un objeto con las propiedades 'first_name', 'last_name', 'email', 'role', 'pets' y 'password'", async () => {
      let { body } = await requester.get(`/api/users/${this.userId}`);
      let propiedades = [
        "_id",
        "first_name",
        "last_name",
        "email",
        "role",
        "pets",
        "password",
      ];
      for (const propiedad of propiedades) {
        expect(body.payload).to.have.property(propiedad);
      }
      this.userName = body.payload.first_name;
    });

    it("Si envio un ID invalido dara un mensaje de error y code 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      let { body, statusCode } = await requester.get(`/api/users/${fakeId}`);
      expect(body).to.have.property("error").and.to.be.equal("User not found");
      expect(statusCode).to.be.equal(404);
    });
  });

  describe("PUT /api/users/:uid", () => {
    it("Si envio un ID valido y un body con datos validos, debe actualizar el usuario y devolver un status code 200 y message 'User updated'", async () => {
      const updateBody = { first_name: "UpdatedName2" };
      let { body, statusCode } = await requester
        .put(`/api/users/${this.userId}`)
        .send(updateBody);
      expect(body).to.have.property("status").and.to.be.equal("success");
      expect(body).to.have.property("message").and.to.be.equal("User updated");
      expect(statusCode).to.be.equal(200);
    });

    it("Si envio un ID invalido, debe devolver un status code 404 y un mensaje de error 'User not found'", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateBody = { first_name: "UpdatedName" };
      let { body, statusCode } = await requester
        .put(`/api/users/${fakeId}`)
        .send(updateBody);
      expect(body).to.have.property("error").and.to.be.equal("User not found");
      expect(statusCode).to.be.equal(404);
    });
  });

  describe("DELETE /api/users/:uid", () => {
    it("Si envio un ID valido, debe eliminar el usuario y devolver un status code 200 y message 'User deleted'", async () => {
      let { body, statusCode } = await requester.delete(
        `/api/users/${this.userId}`
      );
      expect(body).to.have.property("status").and.to.be.equal("success");
      expect(body).to.have.property("message").and.to.be.equal("User deleted");
      expect(statusCode).to.be.equal(200);
    });

  });
});
