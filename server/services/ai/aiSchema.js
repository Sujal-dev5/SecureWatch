const securityAnalysisSchema = {
    type: "object",

    properties: {

        // --------------------------------------------------
        // Executive Summary
        // --------------------------------------------------

        executiveSummary: {
            type: "object",

            properties: {
                overview: {
                    type: "string",
                },

                mainConcern: {
                    type: "string",
                },

                focusAreas: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            },

            required: [
                "overview",
                "mainConcern",
                "focusAreas",
            ],
        },


        // --------------------------------------------------
        // Overall Risk
        // --------------------------------------------------

        overallRisk: {
            type: "string",

            enum: [
                "Low",
                "Moderate",
                "High",
                "Critical",
            ],
        },


        // --------------------------------------------------
        // Key Risks
        // --------------------------------------------------

        keyRisks: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string",
                    },

                    priority: {
                        type: "string",

                        enum: [
                            "Critical",
                            "High",
                            "Medium",
                            "Low",
                            "Informational",
                        ],
                    },

                    whatWasFound: {
                        type: "string",
                    },

                    technicalExplanation: {
                        type: "string",
                    },

                    whyItMatters: {
                        type: "string",
                    },

                    simpleExample: {
                        type: "string",
                    },
                },

                required: [
                    "title",
                    "priority",
                    "whatWasFound",
                    "technicalExplanation",
                    "whyItMatters",
                    "simpleExample",
                ],
            },
        },


        // --------------------------------------------------
        // Business Impact
        // --------------------------------------------------

        businessImpact: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    impact: {
                        type: "string",
                    },

                    explanation: {
                        type: "string",
                    },

                    simpleExample: {
                        type: "string",
                    },
                },

                required: [
                    "impact",
                    "explanation",
                    "simpleExample",
                ],
            },
        },


        // --------------------------------------------------
        // Remediation
        // --------------------------------------------------

        remediation: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string",
                    },

                    priority: {
                        type: "string",

                        enum: [
                            "Critical",
                            "High",
                            "Medium",
                            "Low",
                        ],
                    },

                    whatToDo: {
                        type: "string",
                    },

                    whyItMatters: {
                        type: "string",
                    },

                    technicalSteps: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },
                },

                required: [
                    "title",
                    "priority",
                    "whatToDo",
                    "whyItMatters",
                    "technicalSteps",
                ],
            },
        },


        // --------------------------------------------------
        // Potential Attack Paths
        // --------------------------------------------------

        attackPaths: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    title: {
                        type: "string",
                    },

                    likelihood: {
                        type: "string",
                    },

                    whatCouldHappen: {
                        type: "string",
                    },

                    technicalExplanation: {
                        type: "string",
                    },

                    simpleExample: {
                        type: "string",
                    },

                    findings: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },
                },

                required: [
                    "title",
                    "likelihood",
                    "whatCouldHappen",
                    "technicalExplanation",
                    "simpleExample",
                    "findings",
                ],
            },
        },
    },


    required: [
        "executiveSummary",
        "overallRisk",
        "keyRisks",
        "businessImpact",
        "remediation",
        "attackPaths",
    ],
};

const vulnerabilityAnalysisSchema = {
    type: "object",

    properties: {
        whatIsThis: {
            type: "string",
        },

        whyItMatters: {
            type: "string",
        },

        impact: {
            type: "string",
        },

        evidenceAnalysis: {
            type: "string",
        },

        recommendedSolution: {
            type: "string",
        },

        technicalSteps: {
            type: "array",
            items: {
                type: "string",
            },
        },
    },

    required: [
        "whatIsThis",
        "whyItMatters",
        "impact",
        "evidenceAnalysis",
        "recommendedSolution",
        "technicalSteps",
    ],
};


module.exports = {
    securityAnalysisSchema,
    vulnerabilityAnalysisSchema,
};