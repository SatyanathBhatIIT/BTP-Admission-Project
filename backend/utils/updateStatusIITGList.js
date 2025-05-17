var XLSX = require("xlsx");
var mysql = require("mysql2");
const { selectQuery } = require("./sqlqueries");
const connection = require("../config/dbConfig");

async function updateDecision(
  con,
  applicant,
  round,
  appNoColumnName,
  candidateDecisonColumnName,
  branch
) {
  currAppNo = applicant[appNoColumnName];
  currDecision = applicant[candidateDecisonColumnName];
  // console.log("Current Decision:", currDecision);
  // console.log("Current AppNo:", currAppNo);
  // console.log(currAppNo, currDecision);
  try {
    // Check previous status
    var [checkPreviousStatus] = await con.query(
      `SELECT OfferedRound, RetainRound, RejectOrAcceptRound FROM applicationstatus WHERE 
        AppNo = ? AND branch = ?;`,
      [currAppNo, branch]
    );
    // console.log("Previous status:", checkPreviousStatus);
    bool_previousRetain = checkPreviousStatus[0].RetainRound != ""; // Check if previously retained
    bool_previousRejectOrAccept =
      checkPreviousStatus[0].RejectOrAcceptRound != ""; // Check if previously rejected or accepted
    if (currDecision == "Reject and Wait") {
      if (!bool_previousRejectOrAccept) {
        // Update the status to rejected('N')
        try {
          var [updatedStatus] = await con.query(
            `UPDATE applicationstatus
                        SET Accepted = 'N', RejectOrAcceptRound = ?
                        WHERE AppNo = ? AND branch = ?;`,
            [round, currAppNo, branch]
          );
        } catch (error) {
          throw error;
        }
      }
    } else if (currDecision == "Retain and Wait") {
      if (!bool_previousRetain) {
        try {
          // Update the status to retain('R')
          var [updatedStatus] = await con.query(
            `UPDATE applicationstatus
                        SET Accepted = 'R', retainRound = ?
                        WHERE AppNo = ? AND branch = ?;`,
            [round, currAppNo, branch]
          );
        } catch (error) {
          throw error;
        }
      }
    } else if (currDecision == "Accept and Freeze") {
      if (!bool_previousRejectOrAccept) {
        try {
          // Update the status to accept('Y')
          var [updatedStatus] = await con.query(
            `UPDATE applicationstatus
                        SET Accepted = 'Y', RejectOrAcceptRound = ?
                        WHERE AppNo = ? AND branch = ?;`,
            [round, currAppNo, branch]
          );
        } catch (error) {
          throw error;
        }
      }
    }
  } catch (error) {
    throw error;
  }
  // console.log(`Updated candidate Decision ${currAppNo}`);
}

async function updateStatusIITGList(
  databaseName,
  filePath,
  round,
  appNoColumnName,
  candidateDecisonColumnName,
  branch
) {
  // var con = mysql
  //   .createPool({
  //     // host: process.env.MYSQL_HOSTNAME,
  //     host: process.env.MYSQL_HOST_IP || "127.0.0.1",
  //     user: "root",
  //     password: process.env.MYSQL_PASSWORD,
  //     database: process.env.MYSQL_DATABASE,
  //     debug: false,
  //     insecureAuth: true,
  //   })
  //   .promise();
  var con = connection
  var workbook = XLSX.readFile(filePath);
  var applicantsDataSheet = workbook.Sheets[workbook.SheetNames[0]];
  var applicantsData = XLSX.utils.sheet_to_json(applicantsDataSheet);
  for (const applicant of applicantsData) {
    try {
      // console.log(
      //   "par jab mein idhar aagaya hun upload karne toh, branch to esa hai na: ",
      //   branch
      // );
      // console.log(
      //   "aur ye bhi dekhlo applicant[appNoColumnName]: ",
      //   applicant[appNoColumnName]
      // );
      var [isCS] = await con.query(
        `SELECT COUNT(*) AS count FROM applicationstatus WHERE 
            AppNo = ? AND branch = ?;`,
        [applicant[appNoColumnName], branch]
      );
      if (isCS[0].count == 1) {
        try {
          await updateDecision(
            con,
            applicant,
            round,
            appNoColumnName,
            candidateDecisonColumnName,
            branch
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { updateStatusIITGList };
