const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //Returns array of Object keys
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //Maps a new array returning the given arguments as a SQL query
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //Returns an Object with 2 keys, the values being arrays. containing the Columns to be changed
  //the other veing the values
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

//Creates a sanitized WHERE SQL statement based on the given Query Parameters
function sqlForGetQueryParamsCompany(keys){
  let sqlWhereArray = keys.map((val,idx) => {
    if(val === 'name'){
      return ' name ILIKE ' + '$' + (idx + 1) + ' ';
    };
    if(val === 'minEmployees'){
      return ' num_employees >= ' + '$' + (idx + 1) + ' ';
    };
    if(val === 'maxEmployees'){
      return ' num_employees <= ' + '$' + (idx + 1) + ' ';
    };
  });
  return sqlWhereArray.join('AND');
};

function sqlForGetQueryParamsJobs(keys, vals){
  let sqlWhereArray = keys.map((val,idx) => {
    if(val === 'title'){
      return ' title ILIKE ' + '$' + (idx + 1) + ' ';
    };
    if(val === 'minSalary'){
      return ' salary >= ' + '$' + (idx + 1) + ' ';
    };
    if(val === 'hasEquity' && vals[idx]){
      return ' equity >= ' + '$' + (idx + 1) + ' ';
    };
  });
  return sqlWhereArray.join('AND');
};

module.exports = { sqlForPartialUpdate,
                   sqlForGetQueryParamsCompany,
                   sqlForGetQueryParamsJobs };
