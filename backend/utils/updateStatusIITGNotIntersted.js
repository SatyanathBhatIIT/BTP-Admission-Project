var XLSX = require("xlsx");
var mysql = require("mysql2");
const { selectQuery } = require("./sqlqueries");
const connection = require("../config/dbConfig");
// const { checkFileLegitimacy } = require('./checkLegitimacy');

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
  // console.log(currAppNo, currDecision);
  try {
    var [checkPreviousStatus] =
      await con.query(`SELECT OfferedRound, RetainRound, RejectOrAcceptRound FROM applicationstatus WHERE 
        AppNo = '${currAppNo}' AND branch = '${branch}';`);
    bool_previousRetain = checkPreviousStatus[0].RetainRound != "";
    bool_previousRejectOrAccept =
      checkPreviousStatus[0].RejectOrAcceptRound != "";
    if (currDecision && currDecision.includes(`ACCEPTED`)) {
      try {
        var [updatedStatus] = await con.query(`UPDATE applicationstatus
                    SET Accepted = 'E', RejectOrAcceptRound = '${round}'
                    WHERE AppNo = '${currAppNo}' AND branch = '${branch}';`);
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    throw error;
  }
  // console.log(`updated candidate Desion ${currAppNo}`);
}

async function updateStatusIITGNotInterested(
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
      var [isCS] =
        await con.query(`SELECT COUNT(*) AS count FROM applicationstatus WHERE 
            AppNo = '${applicant[appNoColumnName]}' AND branch = '${branch}';`);
      if (isCS[0].count == 1) {
        try {
          var x = await updateDecision(
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

module.exports = { updateStatusIITGNotInterested };
