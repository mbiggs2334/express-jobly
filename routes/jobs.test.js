"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  /************************************** POST /companies */

describe("POST /jobs", function () {
    const newJob = {
      title: "Engineer",
      equity: 0.6,
      salary: 60000,
      companyHandle: "c2"
    };
  
    test("admin user", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: {title: "Engineer",
              equity: "0.6",
              salary: 60000,
              company_handle: 'c2'},
      });
    });
  
    test("non admin user", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
      expect(resp.body).toEqual({ error: { message: 'Unauthorized', status: 401 } });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: 10,
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: 'orange',
            salary: 'not a number',
            equity: 'also not a number',
            companyHandle: 3
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  /************************************** GET /companies */
  
  describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body.jobs.length).toEqual(2);
    });
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(500);
    });
  });
  
  /************************************** GET /companies/:handle */
  
  describe("GET /jobs/:title", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/developer`);
      expect(resp.body).toEqual({
          job: {
        title: "Developer",
        company_handle: 'c2',
        equity: "1.0",
        salary: 5000000
          }
      });
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app).get(`/job/nope`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  
  /************************************** PATCH /companies/:handle */
  
  describe("PATCH /jobs/:title", function () {
    test("admin user", async function () {
      const resp = await request(app)
          .patch(`/jobs/Developer`)
          .send({
            title: "Developer-new",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({
        job: {
          title: "Developer-new",
          company_handle: 'c2',
          equity: "1.0",
          salary: 5000000
        },
      });
    });
  
    test("non admin user", async function () {
      const resp = await request(app)
          .patch(`/jobs/developer`)
          .send({
            title: "Developer-new-two",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.body).toEqual({ error: { message: 'Unauthorized', status: 401 } });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/developer`)
          .send({
            name: "D-new",
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such company", async function () {
      const resp = await request(app)
          .patch(`/jobs/nope`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/developer`)
          .send({
            title: 246,
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
//   /************************************** DELETE /companies/:handle */
  
  describe("DELETE /jobs/:title", function () {
    test("admin user", async function () {
      const resp = await request(app)
          .delete(`/jobs/Accountant`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({ deleted: "Accountant" });
    });
  
    test("non admin user", async function () {
      const resp = await request(app)
          .delete(`/jobs/developer`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.body).toEqual({ error: { message: 'Unauthorized', status: 401 } });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/developer`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app)
          .delete(`/jobs/nope`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  