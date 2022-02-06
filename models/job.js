const db = require("../db");
const { sqlForPartialUpdate, sqlForGetQueryParamsJobs } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
  } = require("../expressError");

  class Job {
    /**Create a job (from data), update db, return new job data
     * 
     * data should be { title, salary, equity, companyHandle }
     * 
     * returns { title, salary, equity, companyHandle }
     * 
     * throws BadRequestError if job already in database
     */
  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0]){
      throw new BadRequestError(`Duplicate Job: ${title}`);
    };

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

    /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

    static async findAll() {
        const jobsRes = await db.query(
              `SELECT title,
                      salary,
                      equity,
                      company_handle
               FROM jobs
               ORDER BY title`);
        return jobsRes.rows;
    }

     /** Given a job title, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE title ILIKE $1`,
        [title]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${title}`);

    return job;
  }
  
  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

   static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${title}`);
        console.log(job)
    return job;
  }

    /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

    static async remove(title) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE title = $1
               RETURNING title`,
            [title]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No company: ${title}`);
    }


     /** Queries for jobs based on given query parameters
   * 
   * Accepts { title, minSalary, hasEquity }
   * 
   * Returns { title, salary, equity, company_handle }
   */ 
  static async queryParamGet(queryParams){
    const sqlWhereCol = Object.keys(queryParams);
    const sqlWhereVal = Object.values(queryParams);
    const whereSt = sqlForGetQueryParamsJobs(sqlWhereCol, sqlWhereVal);

    if(sqlWhereCol.indexOf('title') !== -1){
      let idx = sqlWhereCol.indexOf('title')
      sqlWhereVal[idx] = '%' + sqlWhereVal[idx] + '%';
    };

    const results = await db.query(`
    SELECT title,
            salary,
            equity,
            company_handle
           FROM jobs
           WHERE ${whereSt}`, [...sqlWhereVal]);

    return results.rows
  }


  };

  module.exports = Job;