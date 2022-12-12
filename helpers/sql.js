const { BadRequestError } = require("../expressError");

/**
 * Helper function to make SET clause in SQL UPDATE statement
 * 
 * @param {*} dataToUpdate {Object} {input data coming in from req.body}
 * @param {*} jsToSql {Object} maps data fields to database column names
 * @returns {Object} {sqlSetCols, dataToUpdate}
 * @example {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate };
