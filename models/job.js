"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Jobs {
    /**
     * Create a job, update db and return job
     * data is {title, salary, equity, company_handle}
     * returned values are {id, title, salary, equity, company_handle}
     */
    
    static async create(data) {
        const addedJob = await db.query(`
        INSERT INTO jobs (
            title,
            salary,
            equity,
            company_handle
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,[
            data.title,
            data.salary,
            data.equity,
            data.company_handle
        ])
        let job = addedJob.rows[0];
        return job;
    }

    /**
     * This method without search filters returns all jobs
     * Jobs can be filtered using the following parameters:
     *  salary
     *  hasequity
     *  title
     */

    static async findAll ({ minSalary, hasequity, title }) {
        let query = `SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                        FROM jobs j
                        LEFT JOIN companies AS c ON c.handle = j.company_handle`
        let whereexpression = [];
        let queryval = [];

        if (minSalary != undefined) {
            queryval.push(minSalary);
            whereexpression.push(`j.salary >= $${queryval.length}`)
        }

        if (hasequity) {
            whereexpression.push(`j.equity > 0`)
        }

        if (title) {
            queryval.push(`%${title}%`);
            whereexpression.push(`j.title ILIKE $${queryval.length}`)
        }

        if (whereexpression.length > 0) {
            query += " WHERE " + whereexpression.join(" AND ");
        }

        query += " ORDER BY title ";
        const jobres = await db.query(query, queryval);
        return jobres.rows[0];
    }

    /**
     * Given an id returns data about the job
     * {id, title, salary, equity, companydetails}
     * company details includes the following data
     * {handle, name, num_Employees, description, logo_url}
     */

    static async get(id) {
        const jobDetails = await db.query(`
        SELECT * FROM jobs
        WHERE id=$1`, [id])

        let job = jobDetails.rows[0];

        if (!job) throw new NotFoundError(`No job with id: ${id}`)

        const companyDetails = await db.query(`
        SELECT handle, 
                name,
                num_Employees AS "numofEmployees",
                description,
                logo_url AS "logourl"
            FROM companies
            WHERE handle=$1
        `, [job.company_handle])

        job.company = companyDetails.rows[0];
        delete job.company_handle
        return job;
    }

    /**
     * This is a partial update
     * Data - {title, salary, equity }. All values optional.
     * Returns {id, title, salary, equity, companyHandle }
     */
    static async update (id, data) {
        const {setCols, values} = sqlForPartialUpdate(data, {});
        const idIdx = "$" + (values.length + 1);
        
        const querySql = `UPDATE jobs 
                            SET ${setCols}
                            WHERE ID = ${idIdx}
                            RETURNING id, 
                                    title,
                                    salary,
                                    equity,
                                    company_handle`
        
        values.push(id);
        const result = await db.query(querySql, values);
        console.log(values);
        const job = result.rows[0]
        console.log(job)
        if (!job) throw new NotFoundError(`No job with id: ${id}`);
        return job;
    }
    /**
     * 
     */

    static async remove(id) {
        const deleteJob = await db.query(`
        DELETE FROM jobs
        WHERE id = $1
        RETURNING id`, [id])

        let job = deleteJob.rows[0]

        if (!job) return NotFoundError(`No job with id: ${id}`);

    }
}

module.exports = Jobs;