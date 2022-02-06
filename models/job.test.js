"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: .5,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      title: "new",
      salary: 50000,
      equity: "0.5",
      company_handle: "c1",
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 50000,
        equity: "0.5",
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        "company_handle": "c1",
        "equity": "0.5",
        "salary": 7,
        "title": "Accountant",
      },
      {
        "company_handle": "c2",
        "equity": "1.0",
        "salary": 5000000,
        "title": "Developer",
      }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("Developer");
    expect(job).toEqual({
      "company_handle": "c2",
        "equity": "1.0",
        "salary": 5000000,
        "title": "Developer",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    salary: 5000001
  };

  test("works", async function () {
    let job = await Job.update("Developer", updateData);
    expect(job).toEqual({
      company_handle: 'c2',
      equity: "1.0",
      salary: 5000001,
      title: "Developer",
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'Developer'`);
    expect(result.rows).toEqual([{
      company_handle: "c2",
      title: "Developer",
      equity: "1.0",
      salary: 5000001
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("Accountant");
    const res = await db.query(
        "SELECT title FROM jobs WHERE title='Accountant'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** Query Param GET */

describe("queryParamGet", () => {

  test("GET with name and maximum Params", async() =>{
    const data = {
      minSalary: 8
    };
    const results = await Job.queryParamGet(data);
    expect(results.length).toEqual(1);
  });

});