const PDFDocument = require("pdfkit");


// ==================================================
// SecureWatch AI
// Professional Security Assessment Report
// Final Polished Version
// ==================================================


// --------------------------------------------------
// PAGE CONSTANTS
// --------------------------------------------------

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN = 45;

const CONTENT_WIDTH =
    PAGE_WIDTH - MARGIN * 2;

const FOOTER_Y =
    PAGE_HEIGHT - 35;


// --------------------------------------------------
// COLORS
// --------------------------------------------------

const COLORS = {

    navy: "#0F172A",
    navyLight: "#1E293B",

    blue: "#2563EB",
    blueLight: "#EFF6FF",

    red: "#DC2626",
    redDark: "#B91C1C",
    redLight: "#FEF2F2",

    orange: "#EA580C",
    orangeLight: "#FFF7ED",

    green: "#16A34A",
    greenLight: "#F0FDF4",

    purple: "#7C3AED",
    purpleLight: "#F5F3FF",

    gray900: "#111827",
    gray800: "#1F2937",
    gray700: "#374151",
    gray600: "#4B5563",
    gray500: "#6B7280",
    gray400: "#9CA3AF",
    gray300: "#D1D5DB",
    gray200: "#E5E7EB",
    gray100: "#F3F4F6",
    gray50: "#F9FAFB",

    white: "#FFFFFF",

};


// --------------------------------------------------
// SAFE VALUE
// --------------------------------------------------

const safeValue = (
    value,
    fallback = "N/A"
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;

    }

    return String(value);

};


// --------------------------------------------------
// HEALTH COLOR
// --------------------------------------------------

const getHealthColor = (
    score
) => {

    const value =
        Number(score) || 0;


    if (value >= 80) {

        return COLORS.green;

    }


    if (value >= 60) {

        return COLORS.orange;

    }


    if (value >= 40) {

        return "#D97706";

    }


    return COLORS.red;

};


// --------------------------------------------------
// PRIORITY COLOR
// --------------------------------------------------

const getPriorityColor = (
    priority
) => {

    switch (
        String(priority || "")
            .toLowerCase()
    ) {

        case "critical":
            return COLORS.red;

        case "high":
            return COLORS.redDark;

        case "medium":
            return COLORS.orange;

        case "low":
            return COLORS.blue;

        default:
            return COLORS.gray500;

    }

};


// --------------------------------------------------
// PRIORITY BACKGROUND
// --------------------------------------------------

const getPriorityBackground = (
    priority
) => {

    switch (
        String(priority || "")
            .toLowerCase()
    ) {

        case "critical":
        case "high":
            return COLORS.redLight;

        case "medium":
            return COLORS.orangeLight;

        case "low":
            return COLORS.blueLight;

        default:
            return COLORS.gray100;

    }

};


// ==================================================
// PAGE HEADER
// ==================================================

const drawPageHeader = (
    doc,
    title,
    subtitle = ""
) => {

    doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(COLORS.gray900)
        .text(
            title,
            MARGIN,
            45,
            {
                width: CONTENT_WIDTH,
                height: 22,
                lineBreak: false,
            }
        );


    doc
        .rect(
            MARGIN,
            72,
            45,
            3
        )
        .fillColor(COLORS.blue)
        .fill();


    if (subtitle) {

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor(COLORS.gray500)
            .text(
                subtitle,
                MARGIN,
                83,
                {
                    width: CONTENT_WIDTH,
                    height: 13,
                    lineBreak: false,
                }
            );

    }

};


// ==================================================
// FOOTER
// ==================================================

const drawFooter = (
    doc,
    pageNumber,
    totalPages
) => {

    const lineY =
        FOOTER_Y - 9;


    doc
        .moveTo(
            MARGIN,
            lineY
        )
        .lineTo(
            PAGE_WIDTH - MARGIN,
            lineY
        )
        .lineWidth(0.5)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "SecureWatch AI • Confidential Security Assessment",
            MARGIN,
            FOOTER_Y,
            {
                width: 300,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            `Page ${pageNumber} of ${totalPages}`,
            PAGE_WIDTH - MARGIN - 80,
            FOOTER_Y,
            {
                width: 80,
                height: 10,
                align: "right",
                lineBreak: false,
            }
        );

};


// ==================================================
// SECTION LABEL
// ==================================================

const drawSectionLabel = (
    doc,
    title,
    x,
    y,
    width = CONTENT_WIDTH
) => {

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(
            COLORS.gray900
        )
        .text(
            title,
            x,
            y,
            {
                width,
                height: 16,
                lineBreak: false,
            }
        );


    doc
        .rect(
            x,
            y + 21,
            32,
            2
        )
        .fillColor(
            COLORS.blue
        )
        .fill();

};


// ==================================================
// METRIC CARD
// ==================================================

const drawMetricCard = (
    doc,
    x,
    y,
    width,
    value,
    label,
    accent
) => {

    const height = 72;


    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            8
        )
        .fillColor(
            COLORS.white
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .rect(
            x,
            y,
            4,
            height
        )
        .fillColor(
            accent
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(19)
        .fillColor(
            COLORS.gray900
        )
        .text(
            safeValue(
                value,
                "0"
            ),
            x + 15,
            y + 13,
            {
                width:
                    width - 25,
                height: 22,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            label.toUpperCase(),
            x + 15,
            y + 45,
            {
                width:
                    width - 25,
                height: 10,
                lineBreak: false,
            }
        );

};


// ==================================================
// HEALTH SCORE CARD
// ==================================================

const drawHealthCard = (
    doc,
    x,
    y,
    width,
    score,
    status
) => {

    const height = 120;

    const numericScore =
        Number(score) || 0;

    const color =
        getHealthColor(
            numericScore
        );


    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            10
        )
        .fillColor(
            COLORS.gray50
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    const centerX =
        x + 72;

    const centerY =
        y + 60;


    doc
        .circle(
            centerX,
            centerY,
            43
        )
        .fillColor(
            color
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(
            COLORS.white
        )
        .text(
            numericScore.toFixed(1),
            centerX - 34,
            centerY - 11,
            {
                width: 68,
                height: 20,
                align: "center",
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.white
        )
        .text(
            "/ 100",
            centerX - 34,
            centerY + 13,
            {
                width: 68,
                height: 10,
                align: "center",
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(
            color
        )
        .text(
            safeValue(
                status,
                "Unknown"
            ).toUpperCase(),
            x + 135,
            y + 32,
            {
                width:
                    width - 155,
                height: 22,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(
            COLORS.gray600
        )
        .text(
            "Security Health Score",
            x + 135,
            y + 59,
            {
                width:
                    width - 155,
                height: 13,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "Calculated by the SecureWatch Vulnerability Intelligence Engine.",
            x + 135,
            y + 78,
            {
                width:
                    width - 155,
                height: 25,
                lineGap: 2,
            }
        );

};


// ==================================================
// SEVERITY ROW
// ==================================================

const drawSeverityRow = (
    doc,
    label,
    value,
    color,
    y,
    maxValue
) => {

    const labelWidth = 85;

    const barX =
        MARGIN + labelWidth;

    const barWidth =
        CONTENT_WIDTH -
        labelWidth -
        40;


    const numericValue =
        Number(value) || 0;


    const percentage =
        Math.min(
            numericValue /
                Math.max(
                    Number(maxValue) || 1,
                    1
                ),
            1
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.gray700
        )
        .text(
            label,
            MARGIN,
            y + 1,
            {
                width:
                    labelWidth - 5,
                height: 12,
                lineBreak: false,
            }
        );


    doc
        .roundedRect(
            barX,
            y,
            barWidth,
            13,
            5
        )
        .fillColor(
            COLORS.gray100
        )
        .fill();


    if (numericValue > 0) {

        doc
            .roundedRect(
                barX,
                y,
                Math.max(
                    10,
                    barWidth *
                        percentage
                ),
                13,
                5
            )
            .fillColor(
                color
            )
            .fill();

    }


    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.gray900
        )
        .text(
            String(
                numericValue
            ),
            barX +
                barWidth +
                10,
            y + 1,
            {
                width: 25,
                height: 12,
                lineBreak: false,
            }
        );

};


// ==================================================
// HISTORY CARD
// ==================================================

const drawHistoryCard = (
    doc,
    x,
    y,
    width,
    label,
    value,
    color
) => {

    doc
        .roundedRect(
            x,
            y,
            width,
            68,
            8
        )
        .fillColor(
            COLORS.white
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .circle(
            x + 22,
            y + 22,
            7
        )
        .fillColor(
            color
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(
            COLORS.gray900
        )
        .text(
            String(
                value || 0
            ),
            x + 38,
            y + 10,
            {
                width:
                    width - 50,
                height: 22,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            label,
            x + 38,
            y + 40,
            {
                width:
                    width - 50,
                height: 10,
                lineBreak: false,
            }
        );

};


// ==================================================
// RISK SUMMARY BOX
// ==================================================

const drawRiskSummary = (
    doc,
    x,
    y,
    width,
    summary,
    healthStatus
) => {

    const height = 112;

    const healthColor =
        getHealthColor(
            healthStatus === "Critical"
                ? 20
                : healthStatus === "At Risk"
                    ? 40
                    : healthStatus === "Moderate"
                        ? 60
                        : 80
        );


    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            9
        )
        .fillColor(
            COLORS.gray50
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(
            COLORS.gray900
        )
        .text(
            "EXECUTIVE RISK SUMMARY",
            x + 16,
            y + 14,
            {
                width:
                    width - 32,
                height: 12,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.gray600
        )
        .text(
            "Priority distribution identified by the SecureWatch Vulnerability Intelligence Engine.",
            x + 16,
            y + 31,
            {
                width:
                    width - 32,
                height: 12,
                lineBreak: false,
            }
        );


    const items = [

        {
            label: "High",
            value: summary.high || 0,
            color: COLORS.redDark,
        },

        {
            label: "Medium",
            value: summary.medium || 0,
            color: COLORS.orange,
        },

        {
            label: "Low",
            value: summary.low || 0,
            color: COLORS.blue,
        },

        {
            label: "Info",
            value: summary.informational || 0,
            color: COLORS.gray500,
        },

    ];


    const gap = 8;

    const itemWidth =
        (
            width -
            32 -
            gap * 3
        ) / 4;


    items.forEach(
        (
            item,
            index
        ) => {

            const itemX =
                x +
                16 +
                index *
                    (
                        itemWidth +
                        gap
                    );


            doc
                .roundedRect(
                    itemX,
                    y + 52,
                    itemWidth,
                    42,
                    6
                )
                .fillColor(
                    COLORS.white
                )
                .fill()
                .lineWidth(1)
                .strokeColor(
                    COLORS.gray200
                )
                .stroke();


            doc
                .font("Helvetica-Bold")
                .fontSize(15)
                .fillColor(
                    item.color
                )
                .text(
                    String(
                        item.value
                    ),
                    itemX + 8,
                    y + 59,
                    {
                        width:
                            itemWidth - 16,
                        height: 17,
                        align: "center",
                        lineBreak: false,
                    }
                );


            doc
                .font("Helvetica-Bold")
                .fontSize(6.5)
                .fillColor(
                    COLORS.gray500
                )
                .text(
                    item.label.toUpperCase(),
                    itemX + 8,
                    y + 80,
                    {
                        width:
                            itemWidth - 16,
                        height: 8,
                        align: "center",
                        lineBreak: false,
                    }
                );

        }
    );

};


// ==================================================
// KEY OBSERVATIONS
// ==================================================

const drawKeyObservations = (
    doc,
    x,
    y,
    width,
    summary,
    totalFindings,
    uniqueFindings
) => {

    const height = 118;


    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            9
        )
        .fillColor(
            COLORS.white
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(
            COLORS.gray900
        )
        .text(
            "KEY SECURITY OBSERVATIONS",
            x + 16,
            y + 14,
            {
                width:
                    width - 32,
                height: 12,
                lineBreak: false,
            }
        );


    const observations = [

        `${summary.high || 0} high-priority vulnerabilities require security review.`,

        `${summary.medium || 0} medium-priority vulnerabilities were identified.`,

        `${summary.low || 0} low-priority findings remain in the assessment.`,

        `${totalFindings || 0} raw scanner findings were reduced to ${uniqueFindings || 0} unique vulnerability types.`,

    ];


    observations.forEach(
        (
            observation,
            index
        ) => {

            const itemY =
                y +
                39 +
                index * 18;


            doc
                .circle(
                    x + 21,
                    itemY + 4,
                    3
                )
                .fillColor(
                    COLORS.blue
                )
                .fill();


            doc
                .font("Helvetica")
                .fontSize(7.8)
                .fillColor(
                    COLORS.gray600
                )
                .text(
                    observation,
                    x + 32,
                    itemY,
                    {
                        width:
                            width - 48,
                        height: 12,
                        lineBreak: false,
                    }
                );

        }
    );

};


// ==================================================
// VULNERABILITY CARD
// ==================================================

const drawVulnerabilityCard = (
    doc,
    finding,
    index,
    x,
    y,
    width
) => {

    const height = 100;

    const title =
        safeValue(
            finding.title,
            "Unknown Vulnerability"
        );

    const priority =
        safeValue(
            finding.priority,
            "Informational"
        );

    const score =
        safeValue(
            finding.priorityScore,
            "N/A"
        );

    const category =
        safeValue(
            finding.category,
            "Other"
        );

    const confidence =
        safeValue(
            finding.confidence,
            "Unknown"
        );

    const url =
        safeValue(
            finding.url,
            "N/A"
        );

    const remediation =
        safeValue(
            finding.remediation,
            "No remediation guidance available."
        );

    const priorityColor =
        getPriorityColor(
            priority
        );

    const priorityBackground =
        getPriorityBackground(
            priority
        );


    // --------------------------------------------------
    // CARD
    // --------------------------------------------------

    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            8
        )
        .fillColor(
            COLORS.white
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    // Priority accent

    doc
        .rect(
            x,
            y,
            5,
            height
        )
        .fillColor(
            priorityColor
        )
        .fill();


    // Finding number

    doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(
            COLORS.gray500
        )
        .text(
            `#${String(
                index + 1
            ).padStart(
                2,
                "0"
            )}`,
            x + 16,
            y + 10,
            {
                width: 28,
                height: 10,
                lineBreak: false,
            }
        );


    // Priority badge

    doc
        .roundedRect(
            x + 49,
            y + 7,
            62,
            18,
            5
        )
        .fillColor(
            priorityBackground
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            priorityColor
        )
        .text(
            priority.toUpperCase(),
            x + 49,
            y + 12,
            {
                width: 62,
                height: 9,
                align: "center",
                lineBreak: false,
            }
        );


    // VIE score

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            COLORS.gray900
        )
        .text(
            `VIE Score: ${score}`,
            x + width - 105,
            y + 11,
            {
                width: 90,
                height: 10,
                align: "right",
                lineBreak: false,
            }
        );


    // Vulnerability title

    doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(
            COLORS.gray900
        )
        .text(
            title,
            x + 16,
            y + 34,
            {
                width:
                    width - 32,
                height: 13,
                ellipsis: true,
                lineBreak: false,
            }
        );


    // Category + confidence

    doc
        .font("Helvetica")
        .fontSize(7.3)
        .fillColor(
            COLORS.gray500
        )
        .text(
            `Category: ${category}  •  Confidence: ${confidence}`,
            x + 16,
            y + 52,
            {
                width:
                    width - 32,
                height: 10,
                ellipsis: true,
                lineBreak: false,
            }
        );


    // Affected URL

    doc
        .font("Helvetica")
        .fontSize(6.8)
        .fillColor(
            COLORS.gray600
        )
        .text(
            url,
            x + 16,
            y + 68,
            {
                width:
                    width - 32,
                height: 9,
                ellipsis: true,
                lineBreak: false,
            }
        );


    // Recommended remediation

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray700
        )
        .text(
            "Remediation:",
            x + 16,
            y + 83,
            {
                width: 55,
                height: 8,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray600
        )
        .text(
            remediation,
            x + 71,
            y + 83,
            {
                width:
                    width - 87,
                height: 8,
                ellipsis: true,
                lineBreak: false,
            }
        );

};

// ==================================================
// METHODOLOGY ITEM
// ==================================================

const drawMethodologyItem = (
    doc,
    number,
    title,
    description,
    x,
    y,
    width
) => {

    doc
        .circle(
            x + 12,
            y + 13,
            11
        )
        .fillColor(
            COLORS.blue
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.white
        )
        .text(
            number,
            x + 5,
            y + 9,
            {
                width: 14,
                height: 9,
                align: "center",
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.gray900
        )
        .text(
            title,
            x + 32,
            y + 2,
            {
                width:
                    width - 32,
                height: 12,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(7.3)
        .fillColor(
            COLORS.gray600
        )
        .text(
            description,
            x + 32,
            y + 17,
            {
                width:
                    width - 32,
                height: 22,
                lineGap: 2,
            }
        );

};


// ==================================================
// GENERATE SECURITY REPORT
// ==================================================

const generateSecurityReport = ({
    reportData,
    outputStream,
}) => {

    const doc =
        new PDFDocument({

            size: "A4",

            margin: MARGIN,

            autoFirstPage: true,

            bufferPages: true,

            info: {

                Title:
                    "SecureWatch AI Security Assessment Report",

                Author:
                    "SecureWatch AI",

                Subject:
                    "Web Application Security Assessment",

            },

        });


    doc.pipe(
        outputStream
    );


    // ------------------------------------------------
    // DATA
    // ------------------------------------------------

    const summary =
        reportData.summary || {};


    const changes =
        reportData.changes || {};


    const findings =
        Array.isArray(
            reportData.uniqueFindings
        )
            ? reportData.uniqueFindings
            : [];


    const healthStatus =
        safeValue(
            reportData.healthStatus,
            "Unknown"
        );


    const cardGap = 10;

    const cardWidth =
        (
            CONTENT_WIDTH -
            cardGap * 2
        ) / 3;


    // =================================================
    // PAGE 1 — COVER
    // =================================================

    doc
        .rect(
            0,
            0,
            PAGE_WIDTH,
            PAGE_HEIGHT
        )
        .fillColor(
            COLORS.navy
        )
        .fill();


    doc
        .rect(
            0,
            0,
            PAGE_WIDTH,
            8
        )
        .fillColor(
            COLORS.blue
        )
        .fill();


    doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor(
            COLORS.white
        )
        .text(
            "SECUREWATCH AI",
            MARGIN,
            105,
            {
                width:
                    CONTENT_WIDTH,
                height: 35,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(
            "#CBD5E1"
        )
        .text(
            "INTELLIGENT WEB APPLICATION SECURITY",
            MARGIN,
            148,
            {
                width:
                    CONTENT_WIDTH,
                height: 14,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(25)
        .fillColor(
            COLORS.white
        )
        .text(
            "Security Assessment Report",
            MARGIN,
            205,
            {
                width:
                    CONTENT_WIDTH,
                height: 30,
                lineBreak: false,
            }
        );


    // Target panel

    doc
        .roundedRect(
            MARGIN,
            295,
            CONTENT_WIDTH,
            190,
            12
        )
        .fillColor(
            COLORS.navyLight
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            "#334155"
        )
        .stroke();


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            "#94A3B8"
        )
        .text(
            "ASSESSMENT TARGET",
            MARGIN + 22,
            318,
            {
                width: 200,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(
            COLORS.white
        )
        .text(
            safeValue(
                reportData.websiteName,
                "Unknown Website"
            ),
            MARGIN + 22,
            338,
            {
                width:
                    CONTENT_WIDTH - 44,
                height: 20,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(
            "#CBD5E1"
        )
        .text(
            safeValue(
                reportData.websiteUrl,
                "Unknown URL"
            ),
            MARGIN + 22,
            365,
            {
                width:
                    CONTENT_WIDTH - 44,
                height: 12,
                ellipsis: true,
                lineBreak: false,
            }
        );


    // Health

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            "#94A3B8"
        )
        .text(
            "SECURITY HEALTH",
            MARGIN + 22,
            402,
            {
                width: 150,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(21)
        .fillColor(
            getHealthColor(
                reportData.healthScore
            )
        )
        .text(
            `${safeValue(
                reportData.healthScore
            )} / 100`,
            MARGIN + 22,
            421,
            {
                width: 160,
                height: 25,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            "#CBD5E1"
        )
        .text(
            `Status: ${healthStatus}`,
            MARGIN + 220,
            428,
            {
                width: 200,
                height: 12,
                lineBreak: false,
            }
        );


    // Metadata inside cover

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            "#94A3B8"
        )
        .text(
            "REPORT METADATA",
            MARGIN + 22,
            458,
            {
                width: 150,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(
            "#CBD5E1"
        )
        .text(
            `Scanner: OWASP ZAP`,
            MARGIN + 22,
            474,
            {
                width: 150,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .text(
            `Intelligence: SecureWatch VIE`,
            MARGIN + 190,
            474,
            {
                width: 200,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            "#94A3B8"
        )
        .text(
            `Assessment Date: ${safeValue(
                reportData.scanDate
            )}`,
            MARGIN,
            690,
            {
                width:
                    CONTENT_WIDTH,
                height: 12,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(
            "#64748B"
        )
        .text(
            "CONFIDENTIAL SECURITY ASSESSMENT",
            MARGIN,
            760,
            {
                width:
                    CONTENT_WIDTH,
                height: 10,
                lineBreak: false,
            }
        );


    // =================================================
    // PAGE 2 — EXECUTIVE SUMMARY
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Executive Summary",
        "High-level overview of the completed security assessment."
    );


    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(
            COLORS.gray700
        )
        .text(
            `The assessment identified ${safeValue(
                reportData.totalFindings,
                "0"
            )} scanner findings representing ${safeValue(
                reportData.uniqueFindingsCount,
                "0"
            )} unique vulnerability types. SecureWatch AI processed the findings through its Vulnerability Intelligence Engine to normalize, categorize, deduplicate and prioritize security issues.`,
            MARGIN,
            120,
            {
                width:
                    CONTENT_WIDTH,
                height: 55,
                lineGap: 4,
            }
        );


    // Metrics

    drawMetricCard(
        doc,
        MARGIN,
        195,
        cardWidth,
        reportData.totalFindings,
        "Raw Findings",
        COLORS.blue
    );


    drawMetricCard(
        doc,
        MARGIN +
            cardWidth +
            cardGap,
        195,
        cardWidth,
        reportData.uniqueFindingsCount,
        "Unique Vulnerabilities",
        COLORS.purple
    );


    drawMetricCard(
        doc,
        MARGIN +
            (
                cardWidth +
                cardGap
            ) * 2,
        195,
        cardWidth,
        reportData.healthScore,
        "Health Score",
        getHealthColor(
            reportData.healthScore
        )
    );


    // Executive risk summary

    drawRiskSummary(
        doc,
        MARGIN,
        295,
        CONTENT_WIDTH,
        summary,
        healthStatus
    );


    // Health

    drawSectionLabel(
        doc,
        "Security Health",
        MARGIN,
        435
    );


    drawHealthCard(
        doc,
        MARGIN,
        465,
        CONTENT_WIDTH,
        reportData.healthScore,
        reportData.healthStatus
    );


    // Assessment information

    drawSectionLabel(
        doc,
        "Assessment Information",
        MARGIN,
        615
    );


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "WEBSITE",
            MARGIN,
            650,
            {
                width: 180,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(
            COLORS.gray900
        )
        .text(
            safeValue(
                reportData.websiteName
            ),
            MARGIN,
            666,
            {
                width: 220,
                height: 12,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "TARGET URL",
            MARGIN + 270,
            650,
            {
                width: 180,
                height: 10,
                lineBreak: false,
            }
        );


    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.gray900
        )
        .text(
            safeValue(
                reportData.websiteUrl
            ),
            MARGIN + 270,
            666,
            {
                width: 230,
                height: 12,
                ellipsis: true,
                lineBreak: false,
            }
        );
    
    // Scan ID

doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(
        COLORS.gray500
    )
    .text(
        "SCAN ID",
        MARGIN,
        700,
        {
            width: 180,
            height: 10,
            lineBreak: false,
        }
    );


doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(
        COLORS.gray900
    )
    .text(
        safeValue(
            reportData.scanId
        ),
        MARGIN,
        716,
        {
            width: 230,
            height: 12,
            ellipsis: true,
            lineBreak: false,
        }
    );


// Assessment Date

doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(
        COLORS.gray500
    )
    .text(
        "ASSESSMENT DATE",
        MARGIN + 270,
        700,
        {
            width: 180,
            height: 10,
            lineBreak: false,
        }
    );


doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(
        COLORS.gray900
    )
    .text(
        safeValue(
            reportData.scanDate
        ),
        MARGIN + 270,
        716,
        {
            width: 230,
            height: 12,
            ellipsis: true,
            lineBreak: false,
        }
    );    

    // =================================================
    // PAGE 3 — SECURITY OVERVIEW
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Security Overview",
        "Severity distribution, historical changes and key security observations."
    );


    drawSectionLabel(
        doc,
        "Vulnerability Severity",
        MARGIN,
        120
    );


    const maxSeverity =
        Math.max(
            summary.critical || 0,
            summary.high || 0,
            summary.medium || 0,
            summary.low || 0,
            summary.informational || 0,
            1
        );


    drawSeverityRow(
        doc,
        "Critical",
        summary.critical || 0,
        COLORS.red,
        160,
        maxSeverity
    );


    drawSeverityRow(
        doc,
        "High",
        summary.high || 0,
        COLORS.redDark,
        195,
        maxSeverity
    );


    drawSeverityRow(
        doc,
        "Medium",
        summary.medium || 0,
        COLORS.orange,
        230,
        maxSeverity
    );


    drawSeverityRow(
        doc,
        "Low",
        summary.low || 0,
        COLORS.blue,
        265,
        maxSeverity
    );


    drawSeverityRow(
        doc,
        "Informational",
        summary.informational || 0,
        COLORS.gray500,
        300,
        maxSeverity
    );


    // Key observations

    drawKeyObservations(
        doc,
        MARGIN,
        350,
        CONTENT_WIDTH,
        summary,
        reportData.totalFindings,
        reportData.uniqueFindingsCount
    );


    // Historical

    drawSectionLabel(
        doc,
        "Historical Analysis",
        MARGIN,
        495
    );


    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "Comparison with the previous completed assessment.",
            MARGIN,
            522,
            {
                width:
                    CONTENT_WIDTH,
                height: 12,
                lineBreak: false,
            }
        );


    const historyGap = 10;

    const historyWidth =
        (
            CONTENT_WIDTH -
            historyGap * 2
        ) / 3;


    drawHistoryCard(
        doc,
        MARGIN,
        550,
        historyWidth,
        "NEW",
        changes.new || 0,
        COLORS.orange
    );


    drawHistoryCard(
        doc,
        MARGIN +
            historyWidth +
            historyGap,
        550,
        historyWidth,
        "RESOLVED",
        changes.resolved || 0,
        COLORS.green
    );


    drawHistoryCard(
        doc,
        MARGIN +
            (
                historyWidth +
                historyGap
            ) * 2,
        550,
        historyWidth,
        "PERSISTENT",
        changes.persistent || 0,
        COLORS.red
    );


    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(
            COLORS.gray600
        )
        .text(
            `Compared with the previous assessment, ${changes.new || 0} vulnerabilities are new, ${changes.resolved || 0} have been resolved, and ${changes.persistent || 0} remain persistent.`,
            MARGIN,
            635,
            {
                width:
                    CONTENT_WIDTH,
                height: 30,
                lineGap: 3,
            }
        );


    // =================================================
    // PAGE 4 — VIE + FINDINGS 1–4
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Vulnerability Intelligence Engine",
        "SecureWatch processing pipeline and highest-priority findings."
    );


    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(
            COLORS.gray700
        )
        .text(
            "SecureWatch AI transforms raw OWASP ZAP scanner output into structured vulnerability intelligence. The VIE normalizes findings, categorizes them, removes duplicate vulnerability instances and assigns context-aware priority scores.",
            MARGIN,
            120,
            {
                width:
                    CONTENT_WIDTH,
                height: 42,
                lineGap: 3,
            }
        );


    const vieSteps = [

        "Scanner findings collected",

        "Finding normalization",

        "Deduplication and categorization",

        "Context-aware priority scoring",

        "Security intelligence generation",

    ];


    vieSteps.forEach(
        (
            step,
            index
        ) => {

            const y =
                175 +
                index * 28;


            doc
                .circle(
                    MARGIN + 9,
                    y + 6,
                    8
                )
                .fillColor(
                    COLORS.blue
                )
                .fill();


            doc
                .font("Helvetica-Bold")
                .fontSize(6.5)
                .fillColor(
                    COLORS.white
                )
                .text(
                    String(
                        index + 1
                    ),
                    MARGIN + 5,
                    y + 3,
                    {
                        width: 8,
                        height: 8,
                        align: "center",
                        lineBreak: false,
                    }
                );


            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(
                    COLORS.gray700
                )
                .text(
                    step,
                    MARGIN + 30,
                    y,
                    {
                        width:
                            CONTENT_WIDTH - 30,
                        height: 12,
                        lineBreak: false,
                    }
                );

        }
    );


    drawSectionLabel(
        doc,
        "Prioritized Vulnerabilities",
        MARGIN,
        325
    );


    doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(
            COLORS.gray500
        )
        .text(
            "Highest-priority unique findings identified by the VIE.",
            MARGIN,
            352,
            {
                width:
                    CONTENT_WIDTH,
                height: 10,
                lineBreak: false,
            }
        );


    findings
        .slice(0, 4)
        .forEach(
            (
                finding,
                index
            ) => {

                drawVulnerabilityCard(
                    doc,
                    finding,
                    index,
                    MARGIN,
                    380 +
                        index * 100,
                    CONTENT_WIDTH
                );

            }
        );


    // =================================================
    // PAGE 5 — FINDINGS 5–8
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Prioritized Vulnerabilities",
        "VIE-ranked findings requiring security review."
    );


    findings
        .slice(4, 8)
        .forEach(
            (
                finding,
                index
            ) => {

                drawVulnerabilityCard(
                    doc,
                    finding,
                    index + 4,
                    MARGIN,
                    125 +
                        index * 105,
                    CONTENT_WIDTH
                );

            }
        );


    // =================================================
    // PAGE 6 — FINDINGS 9–12
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Prioritized Vulnerabilities",
        "Additional findings identified during the security assessment."
    );


    findings
        .slice(8, 12)
        .forEach(
            (
                finding,
                index
            ) => {

                drawVulnerabilityCard(
                    doc,
                    finding,
                    index + 8,
                    MARGIN,
                    125 +
                        index * 105,
                    CONTENT_WIDTH
                );

            }
        );


    // =================================================
    // PAGE 7 — FINDINGS 13–14 + METHODOLOGY
    // =================================================

    doc.addPage();


    drawPageHeader(
        doc,
        "Assessment Details",
        "Final prioritized findings and SecureWatch assessment methodology."
    );


    drawSectionLabel(
        doc,
        "Prioritized Vulnerabilities",
        MARGIN,
        110
    );


    findings
        .slice(12, 14)
        .forEach(
            (
                finding,
                index
            ) => {

                drawVulnerabilityCard(
                    doc,
                    finding,
                    index + 12,
                    MARGIN,
                    145 +
                        index * 100,
                    CONTENT_WIDTH
                );

            }
        );


    drawSectionLabel(
        doc,
        "Assessment Methodology",
        MARGIN,
        365
    );


    const methodology = [

        [
            "1",
            "Target Registration",
            "Authorized web application registered within SecureWatch AI.",
        ],

        [
            "2",
            "Automated Scanning",
            "OWASP ZAP performs spidering and active security assessment.",
        ],

        [
            "3",
            "Finding Collection",
            "Scanner findings are collected and stored for analysis.",
        ],

        [
            "4",
            "Vulnerability Intelligence",
            "SecureWatch normalizes, categorizes, deduplicates and prioritizes findings.",
        ],

        [
            "5",
            "Historical Analysis",
            "Current findings are compared with previous completed assessments.",
        ],

    ];


    methodology.forEach(
        (
            item,
            index
        ) => {

            drawMethodologyItem(
                doc,
                item[0],
                item[1],
                item[2],
                MARGIN,
                400 +
                    index * 45,
                CONTENT_WIDTH
            );

        }
    );


    drawSectionLabel(
        doc,
        "Important Notice",
        MARGIN,
        635
    );


    doc
        .roundedRect(
            MARGIN,
            665,
            CONTENT_WIDTH,
            72,
            8
        )
        .fillColor(
            COLORS.gray50
        )
        .fill()
        .lineWidth(1)
        .strokeColor(
            COLORS.gray200
        )
        .stroke();


    doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(
            COLORS.gray600
        )
        .text(
            "This report is generated from an authorized security assessment performed using OWASP ZAP and SecureWatch AI analysis. Automated findings should be manually validated before remediation or risk acceptance decisions. Security findings may vary depending on application state, configuration and scan conditions.",
            MARGIN + 14,
            682,
            {
                width:
                    CONTENT_WIDTH - 28,
                height: 45,
                lineGap: 3,
            }
        );


    // =================================================
    // FINAL FOOTERS
    // =================================================
    //
    // IMPORTANT:
    // All pages are already created here.
    // Therefore we can calculate the real
    // page count instead of hardcoding "7".
    //

    const pageRange =
        doc.bufferedPageRange();


    const totalPages =
        pageRange.count;


    for (
        let i = pageRange.start;
        i <
            pageRange.start +
            pageRange.count;
        i++
    ) {

        doc.switchToPage(i);


        drawFooter(
            doc,
            i + 1,
            totalPages
        );

    }


    // =================================================
    // FINALIZE
    // =================================================

    doc.end();


    return doc;

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
    generateSecurityReport,
};