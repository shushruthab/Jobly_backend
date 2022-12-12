
const jsonschema = require("jsonschema");
const express = require("express");
const { ensureAdmin } = require("../middleware/auth");
const Jobs = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const db = require("../db");
const { NotBeforeError } = require("jsonwebtoken");
const { BadRequestError } = require("../expressError");
const router = new express.Router();


/** POST / { job } => { job }
 *
 * job => { title, salary, equity, companyHandle }
 *
 * Returns =>  { id, title, salary, equity, companyHandle }
 *
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Jobs.create(req.body);
        return res.status(201).json({job});
    } catch (e) {
        return next(e);
    }
})

/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity 
 * - title 
 */

router.get("/", async function (req, res, next) {
    
    const userquery = req.query;
    if (userquery.minSalary !== undefined) userquery.minSalary = +userquery.minSalary;
    
    try {
        const validator = jsonschema.validate(userquery, jobSearchSchema) 
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

       const jobs = await Jobs.findAll(req.body);
       return res.json({ jobs });

    } catch(e) {
        return next(e)
    }
})

router.get("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const job = await Jobs.get(req.params.id);
        return res.json({job});
    } catch (e) {
        return next(e);
    }
})

/** PATCH /[jobId]  
 *
 * Data { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 */

 router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Jobs.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  

/**
 * DELETE /[jobid] => {deleted: id}
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Jobs.remove(req.params.id);
        return res.json({ deleted: +req.params.id})
    } catch (e) {
        return next(e);
    }
    
})


module.exports = router;