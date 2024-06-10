"use strict";

const express = require("express");
const { mongo } = require("../utils/mongo");

const router = express.Router();

// Base: http://localhost:3000/api/employees/:empId
// Valid: http://localhost:300/api/employees/1007

// Invalid: http://localhost:3000/api/employee/foo
// Invalid: http://localhost:3000/api/employee/9999
router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // early return - design pattern
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));

    }

    // database query is handled
    mongo(async db => {
      const employee = await db.collection("employees").findOne({ empId });


    if (!employee) {
      console.error("Employee not found", empId);
      return next(createError(404, "Employee not found"));
    }
    res.send(employee);
  }, next)

  } catch (err) {
    console.log("Error", err);
    next(err);
  }
});

module.exports = router;
