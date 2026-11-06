const { GoogleGenAI } = require("@google/genai");

const {
  securityAnalysisSchema,
  vulnerabilityAnalysisSchema,
} = require("./aiSchema");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not configured"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const PRIMARY_MODEL =
  "gemini-3.6-flash";

const FALLBACK_MODEL =
  "gemini-3.5-flash-lite";

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

/*
 * Extract useful information from Gemini errors.
 *
 * The SDK can expose error information in
 * slightly different shapes, so we check
 * multiple possible locations.
 */
const getErrorInfo = (error) => {
  const status =
    error?.status ||
    error?.statusCode ||
    error?.error?.code ||
    null;

  const message =
    error?.error?.message ||
    error?.message ||
    "Unknown Gemini API error";

  const errorCode =
    error?.error?.status ||
    error?.error?.code ||
    "";

  return {
    status,
    message,
    errorCode,
  };
};

/*
 * Determine whether a 429 is a temporary
 * rate-limit problem or an exhausted quota.
 */
const isTemporaryRateLimit = (
  errorInfo
) => {
  const text =
    `${errorInfo.errorCode} ${errorInfo.message}`
      .toLowerCase();

  return (
    text.includes("rate_limit") ||
    text.includes("rate limit") ||
    text.includes("too_many_requests") ||
    text.includes("too many requests") ||
    text.includes("per minute") ||
    text.includes("per second")
  );
};

const createQuotaError = (
  errorInfo
) => {
  const error =
    new Error(
      "Gemini API quota has been exhausted. Please wait for the quota to reset or check your Gemini API usage and billing settings."
    );

  error.statusCode = 429;
  error.originalMessage =
    errorInfo.message;

  return error;
};

const createRateLimitError = (
  errorInfo
) => {
  const error =
    new Error(
      "Gemini API rate limit reached. Please wait a moment and try again."
    );

  error.statusCode = 429;
  error.originalMessage =
    errorInfo.message;

  return error;
};

const createUnavailableError = () => {
  const error =
    new Error(
      "Gemini AI service is temporarily unavailable. Please try again shortly."
    );

  error.statusCode = 503;

  return error;
};

/*
 * Generate content using a specific Gemini model.
 *
 * The schema is configurable so the same
 * function can be used for:
 *
 * 1. Whole-scan security analysis
 * 2. Individual vulnerability analysis
 */
const generateWithModel = async (
  model,
  prompt,
  schema = securityAnalysisSchema
) => {
  console.log(
    `Trying Gemini model: ${model}`
  );

  const response =
    await ai.models.generateContent({
      model,

      contents: prompt,

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          schema,

        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    });

  console.log(
    `Gemini model succeeded: ${model}`
  );

  return {
    analysis: JSON.parse(
      response.text
    ),
    model,
  };
};

/*
 * Generate security analysis.
 *
 * Primary:
 *   Gemini 3.6 Flash
 *
 * Fallback:
 *   Gemini 3.5 Flash-Lite
 *
 * Default schema:
 *   securityAnalysisSchema
 *
 * A different schema can be passed for
 * specialized AI analysis.
 */
const generateSecurityAnalysis =
  async (
    prompt,
    schema = securityAnalysisSchema
  ) => {
    if (!apiKey) {
      const error =
        new Error(
          "Gemini API key is not configured"
        );

      error.statusCode = 500;

      throw error;
    }

    /*
     * ========================================
     * 1. PRIMARY MODEL
     * ========================================
     */

    try {
      return await generateWithModel(
        PRIMARY_MODEL,
        prompt,
        schema
      );
    } catch (error) {
      const errorInfo =
        getErrorInfo(error);

      console.warn(
        `${PRIMARY_MODEL} failed:`,
        {
          status:
            errorInfo.status,

          code:
            errorInfo.errorCode,

          message:
            errorInfo.message,
        }
      );

      /*
       * --------------------------------------
       * 429
       * --------------------------------------
       */

      if (
        Number(errorInfo.status) ===
        429
      ) {
        /*
         * Daily/project quota exhausted.
         * Do NOT keep retrying.
         */
        if (
          !isTemporaryRateLimit(
            errorInfo
          )
        ) {
          throw createQuotaError(
            errorInfo
          );
        }

        /*
         * Temporary rate limit.
         * Retry using exponential backoff.
         */
        console.warn(
          "Gemini temporary rate limit. Retrying after backoff..."
        );

        const retryDelays = [
          1000,
          2000,
        ];

        for (
          let i = 0;
          i < retryDelays.length;
          i++
        ) {
          await sleep(
            retryDelays[i]
          );

          try {
            console.log(
              `Retrying ${PRIMARY_MODEL} (${i + 1}/${retryDelays.length})...`
            );

            return await generateWithModel(
              PRIMARY_MODEL,
              prompt,
              schema
            );
          } catch (retryError) {
            const retryInfo =
              getErrorInfo(
                retryError
              );

            console.warn(
              `${PRIMARY_MODEL} retry failed:`,
              {
                status:
                  retryInfo.status,

                code:
                  retryInfo.errorCode,

                message:
                  retryInfo.message,
              }
            );

            /*
             * If retry reveals that
             * the daily quota is exhausted,
             * stop immediately.
             */
            if (
              Number(
                retryInfo.status
              ) === 429 &&
              !isTemporaryRateLimit(
                retryInfo
              )
            ) {
              throw createQuotaError(
                retryInfo
              );
            }

            /*
             * Non-429 error should be
             * handled normally.
             */
            if (
              Number(
                retryInfo.status
              ) !== 429
            ) {
              error = retryError;
              break;
            }
          }
        }

        /*
         * Temporary rate limit continued.
         * Try fallback model once.
         */
      }

      /*
       * --------------------------------------
       * 503
       * --------------------------------------
       */

      else if (
        Number(errorInfo.status) ===
        503
      ) {
        console.warn(
          `${PRIMARY_MODEL} temporarily unavailable. Retrying...`
        );

        await sleep(1000);

        try {
          return await generateWithModel(
            PRIMARY_MODEL,
            prompt,
            schema
          );
        } catch (retryError) {
          const retryInfo =
            getErrorInfo(
              retryError
            );

          console.warn(
            `${PRIMARY_MODEL} retry failed:`,
            {
              status:
                retryInfo.status,

              code:
                retryInfo.errorCode,

              message:
                retryInfo.message,
            }
          );

          if (
            Number(
              retryInfo.status
            ) === 429
          ) {
            if (
              !isTemporaryRateLimit(
                retryInfo
              )
            ) {
              throw createQuotaError(
                retryInfo
              );
            }
          }

          if (
            Number(
              retryInfo.status
            ) !== 503 &&
            Number(
              retryInfo.status
            ) !== 429
          ) {
            throw retryError;
          }
        }
      }

      /*
       * --------------------------------------
       * Unexpected errors
       * --------------------------------------
       */

      else {
        throw error;
      }
    }

    /*
     * ========================================
     * 2. FALLBACK MODEL
     * ========================================
     */

    try {
      console.log(
        `Trying fallback model: ${FALLBACK_MODEL}`
      );

      return await generateWithModel(
        FALLBACK_MODEL,
        prompt,
        schema
      );
    } catch (error) {
      const errorInfo =
        getErrorInfo(error);

      console.warn(
        `${FALLBACK_MODEL} failed:`,
        {
          status:
            errorInfo.status,

          code:
            errorInfo.errorCode,

          message:
            errorInfo.message,
        }
      );

      /*
       * Fallback also exhausted quota.
       */
      if (
        Number(errorInfo.status) ===
        429
      ) {
        if (
          isTemporaryRateLimit(
            errorInfo
          )
        ) {
          throw createRateLimitError(
            errorInfo
          );
        }

        throw createQuotaError(
          errorInfo
        );
      }

      /*
       * Fallback unavailable.
       */
      if (
        Number(errorInfo.status) ===
        503
      ) {
        throw createUnavailableError();
      }

      throw error;
    }
  };

/*
 * Generate AI analysis for an individual
 * vulnerability/finding.
 *
 * Uses the same Gemini models,
 * retry handling, fallback handling,
 * and API-key protection as the
 * whole-scan analysis.
 */
const generateVulnerabilityAnalysis =
  async (prompt) => {
    return generateSecurityAnalysis(
      prompt,
      vulnerabilityAnalysisSchema
    );
  };

module.exports = {
  generateSecurityAnalysis,
  generateVulnerabilityAnalysis,
};