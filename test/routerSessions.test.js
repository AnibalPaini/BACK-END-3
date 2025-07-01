import { expect } from "chai";
import { describe, it } from "mocha";
import mongoose, { isValidObjectId } from "mongoose";

import supertest from "supertest";

try {
  await mongoose.connect(
    "mongodb+srv://coder:coderpass@ecommerce-cluster0.7rqqj.mongodb.net/Mock?retryWrites=true&w=majority&appName=Ecommerce-Cluster0"
  );
} catch (error) {
  console.log(error);
}

const requester = supertest("http://localhost:8080");

describe("Pruebas router sessions", function () {
  this.timeout(10_000);

  after(async () => {
    await mongoose.connection
      .collection("users")
      .deleteMany({ email: "test@test.com" });
  });

  let cookie;

  let userMock = {
    first_name: "test",
    last_name: "test",
    email: "test@test.com",
    password: "123",
  };

  it("Si realizo un post a /api/sessions/register con datos invalidos de un user , retorna un status code 400", async () => {
    let userMockBad = {
      last_name: "test",
      email: "test@test.com",
      password: "123",
    };

    let { statusCode } = await requester
      .post("/api/sessions/register")
      .send(userMockBad);

    expect(statusCode).to.be.eq(400);
  });

  it("Si realizo un post a /api/sessions/register con datos de un user válido, genera un usuario en DB", async () => {
    let { body } = await requester
      .post("/api/sessions/register")
      .send(userMock);

    expect(body).to.has.property("status").and.to.be.eq("success");
    expect(body.payload).to.be.ok;
    expect(isValidObjectId(body.payload)).to.be.true;
  });

  it("Si realizo un post a /api/sessions/login con datos de un user previamente registrado, genera un usuario en DB", async () => {
    let { body } = await requester.post("/api/sessions/login").send(userMock);

    expect(body).to.has.property("status").and.to.be.eq("success");
    expect(body).to.has.property("message").and.to.be.eq("Logged in");
  });

  it("Si realizo un post a /api/sessions/login con datos de un user previamente registrado, retorna una cookie de nombre coderCookie", async () => {
    let { headers } = await requester
      .post("/api/sessions/login")
      .send(userMock);

    cookie = headers["set-cookie"];
    let nombreCookie = cookie[0];
    nombreCookie = nombreCookie.split("=")[0];

    expect(nombreCookie).to.be.eq("coderCookie");
  });

  it("Si hago un get a /api/sessions/current, enviando una cookie obtenida en el login, retorna los datos del usuario logueado", async () => {
    let { body } = await requester
      .get("/api/sessions/current")
      .set("Cookie", cookie);

    expect(body).to.have.property("status").and.to.be.eq("success");
    expect(body.payload).to.have.property("email").and.to.be.eq(userMock.email);
  });
});
