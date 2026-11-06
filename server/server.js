const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const scanRoutes = require("./routes/scanRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const aiRoutes = require("./routes/aiRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const {
  startScheduler,
} = require("./services/monitoring/schedulerService");

const app = express();


// --------------------------------------------------
// Production Proxy Configuration
// --------------------------------------------------
//
// Render and similar platforms place the application
// behind a reverse proxy. Trust the first proxy only
// in production so Express can correctly determine
// the client IP for rate limiting and logging.
//
// Local development remains unchanged.
//

if (
  process.env.NODE_ENV === "production"
) {
  app.set(
    "trust proxy",
    1
  );
}


// --------------------------------------------------
// Security Middleware
// --------------------------------------------------

app.use(
  helmet()
);


// --------------------------------------------------
// CORS
// --------------------------------------------------
//
// Development:
// FRONTEND_URL can remain unset and localhost is allowed.
//
// Production:
// Set FRONTEND_URL to the deployed frontend URL.
//

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);


app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {

      // Allow requests without an Origin header.
      // Useful for health checks/server-to-server requests.

      if (!origin) {
        return callback(
          null,
          true
        );
      }


      if (
        allowedOrigins.includes(
          origin
        )
      ) {

        return callback(
          null,
          true
        );

      }


      const corsError =
        new Error(
          "Not allowed by CORS"
        );

      corsError.statusCode =
        403;

      corsError.code =
        "CORS_BLOCKED";

      return callback(
        corsError
      );

    },

    credentials: true,
  })
);


// --------------------------------------------------
// Request Body Limit
// --------------------------------------------------

app.use(
  express.json({
    limit: "1mb",
  })
);


// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/websites",
  websiteRoutes
);

app.use(
  "/api/scans",
  scanRoutes
);

app.use(
  "/api",
  intelligenceRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/monitoring",
  monitoringRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);


// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get(
  "/api/health",
  (req, res) => {

    res.status(200).json({
      status:
        "SecureWatch AI backend is running",
    });

  }
);


// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    // ----------------------------------------------
    // Always log the server-side error.
    // ----------------------------------------------

    console.error(
      "Unhandled server error:",
      error
    );


    // ----------------------------------------------
    // If response has already started,
    // delegate to Express.
    // ----------------------------------------------

    if (
      res.headersSent
    ) {

      return next(
        error
      );

    }


    // ----------------------------------------------
    // CORS rejection
    // ----------------------------------------------

    if (
      error.code ===
      "CORS_BLOCKED"
    ) {

      return res.status(
        403
      ).json({
        message:
          "Request blocked",
      });

    }


    // ----------------------------------------------
    // Explicit application error
    // ----------------------------------------------

    if (
      error.statusCode
    ) {

      return res.status(
        error.statusCode
      ).json({
        message:
          error.statusCode === 403
            ? "Request blocked"
            : error.message ||
              "Request failed",
      });

    }


    // ----------------------------------------------
    // Unexpected server error
    //
    // Never expose internal error details,
    // stack traces, database errors, etc.
    // ----------------------------------------------

    return res.status(
      500
    ).json({
      message:
        "Internal server error",
    });

  }
);


// --------------------------------------------------
// Server
// --------------------------------------------------

const PORT =
  process.env.PORT || 5000;


const startServer =
  async () => {

    try {

      await connectDB();


      startScheduler();


      app.listen(
        PORT,
        () => {

          console.log(
            `Server running on port ${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        "Failed to start server:",
        error.message
      );

      process.exit(1);

    }

  };


startServer();