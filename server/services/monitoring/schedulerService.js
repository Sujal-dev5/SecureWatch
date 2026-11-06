const cron = require("node-cron");

const Monitoring = require("../../models/Monitoring");

const {
  runMonitoringScan,
} = require("./monitoringService");

let schedulerStarted = false;

const processScheduledMonitorings = async () => {
  try {
    const now = new Date();

    const dueMonitorings = await Monitoring.find({
      enabled: true,
      nextRunAt: {
        $ne: null,
        $lte: now,
      },
    });

    if (dueMonitorings.length === 0) {
      return;
    }

    console.log(
      `Found ${dueMonitorings.length} monitoring task(s) due`
    );

    for (const monitoring of dueMonitorings) {
      try {
        console.log(
          `Running monitoring: ${monitoring._id}`
        );

        await runMonitoringScan(monitoring);
      } catch (error) {
        console.error(
          `Monitoring ${monitoring._id} failed:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Scheduler processing error:",
      error.message
    );
  }
};

const startScheduler = () => {
  if (schedulerStarted) {
    console.log("Monitoring scheduler already running");
    return;
  }

  schedulerStarted = true;

  console.log("Monitoring scheduler started");

  // Check every minute
  cron.schedule("* * * * *", async () => {
    await processScheduledMonitorings();
  });
};

module.exports = {
  startScheduler,
  processScheduledMonitorings,
};