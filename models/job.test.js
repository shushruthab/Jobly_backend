"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Jobs = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newJob = {
    company_handle: "c1",
    title: "Test",
    salary: 100,
    equity: "0.1",
  };

  test("works", async function () {
    let job = await Jobs.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});



/************************************** get */

describe("get", function () {
  test("not found if no such job", async function () {
    try {
      await Jobs.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    salary: 500,
    equity: "0.5",
  };
  
  test("not found if no such job", async function () {
    try {
      await Jobs.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Jobs.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Jobs.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

});
