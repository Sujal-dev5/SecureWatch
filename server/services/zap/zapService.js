const axios = require("axios");

const ZAP_URL = process.env.ZAP_URL;
const ZAP_API_KEY = process.env.ZAP_API_KEY;


// --------------------------------------------------
// ZAP Scan Limits
// --------------------------------------------------

// Maximum total Active Scan duration.
// Default: 15 minutes.
//
// Set to 0 to disable the limit.
const ZAP_MAX_SCAN_DURATION_MINUTES =
  Number(
    process.env.ZAP_MAX_SCAN_DURATION_MINUTES || 15
  );


// Maximum duration for one individual Active Scan rule.
// Default: 3 minutes.
//
// Set to 0 to disable the limit.
const ZAP_MAX_RULE_DURATION_MINUTES =
  Number(
    process.env.ZAP_MAX_RULE_DURATION_MINUTES || 3
  );


// --------------------------------------------------
// ZAP API parameters
// --------------------------------------------------

const zapParams = (params = {}) => ({
  apikey: ZAP_API_KEY,
  ...params,
});


// --------------------------------------------------
// Configure Active Scan Limits
// --------------------------------------------------

const configureActiveScanLimits = async () => {

  // ----------------------------------------------
  // Maximum individual rule duration
  // ----------------------------------------------

  const ruleDurationResponse =
    await axios.get(
      `${ZAP_URL}/JSON/ascan/action/setOptionMaxRuleDurationInMins/`,
      {
        params: zapParams({
          Integer:
            ZAP_MAX_RULE_DURATION_MINUTES,
        }),
      }
    );


  console.log(
    "ZAP maximum rule duration:",
    ZAP_MAX_RULE_DURATION_MINUTES,
    "minutes"
  );


  // ----------------------------------------------
  // Maximum total scan duration
  // ----------------------------------------------

  const scanDurationResponse =
    await axios.get(
      `${ZAP_URL}/JSON/ascan/action/setOptionMaxScanDurationInMins/`,
      {
        params: zapParams({
          Integer:
            ZAP_MAX_SCAN_DURATION_MINUTES,
        }),
      }
    );


  console.log(
    "ZAP maximum scan duration:",
    ZAP_MAX_SCAN_DURATION_MINUTES,
    "minutes"
  );


  return {
    ruleDuration:
      ruleDurationResponse.data,

    scanDuration:
      scanDurationResponse.data,
  };
};


// --------------------------------------------------
// Start Spider Scan
// --------------------------------------------------

const startSpider = async (targetUrl) => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/spider/action/scan/`,
      {
        params: zapParams({
          url: targetUrl,
          recurse: true,
        }),
      }
    );


  console.log(
    "ZAP Spider start response:",
    response.data
  );


  return response.data;
};


// --------------------------------------------------
// Get Spider Progress
// --------------------------------------------------

const getSpiderProgress = async (scanId) => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/spider/view/status/`,
      {
        params: zapParams({
          scanId,
        }),
      }
    );


  return Number(
    response.data.status
  );
};


// --------------------------------------------------
// Stop Spider Scan
// --------------------------------------------------

const stopSpider = async (scanId) => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/spider/action/stop/`,
      {
        params: zapParams({
          scanId,
        }),
      }
    );


  console.log(
    `ZAP Spider stop response for scan ${scanId}:`,
    response.data
  );


  return response.data;
};


// --------------------------------------------------
// Start Active Scan
// --------------------------------------------------

const startActiveScan = async (targetUrl) => {

  // ----------------------------------------------
  // Configure Active Scan limits
  // ----------------------------------------------

  await configureActiveScanLimits();


  // ----------------------------------------------
  // Start Active Scan
  // ----------------------------------------------

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/ascan/action/scan/`,
      {
        params: zapParams({
          url: targetUrl,
          recurse: true,
        }),
      }
    );


  console.log(
    "ZAP Active Scan start response:",
    response.data
  );


  return response.data;
};


// --------------------------------------------------
// Get Active Scan Progress
// --------------------------------------------------

const getActiveScanProgress = async (scanId) => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/ascan/view/status/`,
      {
        params: zapParams({
          scanId,
        }),
      }
    );


  return Number(
    response.data.status
  );
};


// --------------------------------------------------
// Stop Active Scan
// --------------------------------------------------

const stopActiveScan = async (scanId) => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/ascan/action/stop/`,
      {
        params: zapParams({
          scanId,
        }),
      }
    );


  console.log(
    `ZAP Active Scan stop response for scan ${scanId}:`,
    response.data
  );


  return response.data;
};


// --------------------------------------------------
// Get Alerts
// --------------------------------------------------

// --------------------------------------------------
// Get Alerts
// --------------------------------------------------

const getAlerts = async (targetUrl) => {

  const PAGE_SIZE = 1000;

  let start = 0;

  let allAlerts = [];


  while (true) {

    const response =
      await axios.get(
        `${ZAP_URL}/JSON/core/view/alerts/`,
        {
          params: zapParams({

            baseurl:
              targetUrl,

            start,

            count:
              PAGE_SIZE,

          }),
        }
      );


    const alerts =
      response.data.alerts || [];


    // ----------------------------------------------
    // Add current page
    // ----------------------------------------------

    allAlerts.push(
      ...alerts
    );


    console.log(
      `ZAP alerts retrieved: ${allAlerts.length}`
    );


    // ----------------------------------------------
    // Stop when fewer alerts than page size
    // ----------------------------------------------

    if (
      alerts.length <
      PAGE_SIZE
    ) {

      break;

    }


    // ----------------------------------------------
    // Move to next page
    // ----------------------------------------------

    start += PAGE_SIZE;

  }


  console.log(
    `Total ZAP alerts retrieved: ${allAlerts.length}`
  );


  return allAlerts;
};


// --------------------------------------------------
// Test ZAP Connection
// --------------------------------------------------

const testZapConnection = async () => {

  const response =
    await axios.get(
      `${ZAP_URL}/JSON/core/view/version/`,
      {
        params: zapParams(),
      }
    );


  return response.data;
};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {

  ZAP_URL,

  ZAP_API_KEY,

  zapParams,

  testZapConnection,

  startSpider,

  getSpiderProgress,

  stopSpider,

  startActiveScan,

  getActiveScanProgress,

  stopActiveScan,

  getAlerts,

};