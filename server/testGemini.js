require("dotenv").config();

const {
    generateSecurityAnalysis,
} = require("./services/ai/geminiService");

const {
    buildAIContext,
} = require("./services/ai/aiContextBuilder");

const {
    buildSecurityPrompt,
} = require("./services/ai/aiPrompt");

const testGemini = async () => {
    try {
        const context = buildAIContext({
            healthScore: 46,
            healthStatus: "At Risk",

            summary: {
                critical: 0,
                high: 3,
                medium: 5,
                low: 5,
                informational: 4,
            },

            changes: {
                new: 1,
                resolved: 0,
                persistent: 16,
            },

            findings: [
                {
                    title:
                        "Content Security Policy Header Not Set",

                    category:
                        "Security Headers",

                    severity:
                        "Medium",

                    priority:
                        "High",

                    priorityScore:
                        68,

                    confidence:
                        "High",

                    occurrences:
                        4,

                    affectedEndpoints:
                        4,
                },

                {
                    title:
                        "Missing Anti-clickjacking Header",

                    category:
                        "Security Headers",

                    severity:
                        "Medium",

                    priority:
                        "Medium",

                    priorityScore:
                        60,

                    confidence:
                        "High",

                    occurrences:
                        3,

                    affectedEndpoints:
                        3,
                },
            ],

            correlations: [],
        });

        const prompt =
            buildSecurityPrompt(context);

        console.log(
            "\nSending security context to Gemini...\n"
        );

        const result =
            await generateSecurityAnalysis(
                prompt
            );

        console.log(
            "\nGemini Security Analysis:\n"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );
    } catch (error) {
        console.error(
            "\nGemini test failed:\n",
            error
        );
    }
};

testGemini();