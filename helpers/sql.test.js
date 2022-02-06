"use strict";

const db = require("../db");
const NotFoundError = require("../expressError")
const { sqlForPartialUpdate, sqlForGetQueryParams } = require("./sql");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("../models/_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

describe('sqlForPartialUpdate', () => {

  const jsToSql = {
    numEmployees: "num_employees",
      ogoUrl: "logo_url",
  };
    
  test('with params', () => {
    const data = {
      name: 'C1'
    };
    const results = sqlForPartialUpdate(data, jsToSql);
    expect(results.setCols).toEqual('"name"=$1');
    expect(results.values[0]).toEqual('C1');
  });

  test('no keys', () => {
    const data = {};
    expect( () => {
      sqlForPartialUpdate(data, jsToSql)})
    .toThrow();
  });

});

describe('sqlForGetQueryParams', () => {

  test('with `name` parameter', () => {
    const keys = ['name'];
    const results = sqlForGetQueryParams(keys);
    expect(results).toEqual(' name ILIKE $1 ')
  });

  test('with `name` and `minEmployees` parameter', () => {
    const keys = ['name', 'minEmployees'];
    const results = sqlForGetQueryParams(keys);
    expect(results).toEqual(' name ILIKE $1 AND num_employees >= $2 ');
  });

});