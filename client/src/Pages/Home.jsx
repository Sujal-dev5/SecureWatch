function Home() {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "70px 24px 80px",
      }}
    >
      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section
        style={{
          textAlign: "center",
          padding: "50px 0 80px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "7px 14px",
            marginBottom: "20px",
            borderRadius: "999px",
            border: "1px solid #303642",
            background: "#171a21",
            color: "#93c5fd",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          AI-Powered Web Security
        </div>

        <h1
          style={{
            fontSize: "52px",
            lineHeight: "1.1",
            margin: "0 auto 20px",
            maxWidth: "850px",
          }}
        >
          Secure Your Web Applications
          <br />
          <span
            style={{
              color: "#60a5fa",
            }}
          >
            with Intelligent Security Analysis
          </span>
        </h1>

        <p
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            fontSize: "18px",
            lineHeight: "1.7",
            color: "#9ca3af",
          }}
        >
          SecureWatch AI combines automated vulnerability scanning,
          vulnerability intelligence, risk prioritization, and AI-assisted
          security analysis to help you understand and remediate web
          application security risks.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "32px",
          }}
        >
          <a
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            Get Started
          </a>

          <a
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: "8px",
              border: "1px solid #303642",
              background: "#171a21",
              color: "#dbeafe",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Login
          </a>
        </div>
      </section>


      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section
        id="how-it-works"
        style={{
        marginBottom: "80px",
        scrollMarginTop: "90px",
         }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            How It Works
          </p>

          <h2
            style={{
              fontSize: "32px",
              margin: "0 0 12px",
            }}
          >
            From Scan to Security Intelligence
          </h2>

          <p
            style={{
              color: "#9ca3af",
              maxWidth: "650px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            SecureWatch AI transforms raw vulnerability scan results
            into prioritized and actionable security intelligence.
          </p>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          <StepCard
            number="01"
            title="Scan"
            description="Run an authorized security assessment using OWASP ZAP."
          />

          <StepCard
            number="02"
            title="Analyze"
            description="The Vulnerability Intelligence Engine normalizes, categorizes, and prioritizes findings."
          />

          <StepCard
            number="03"
            title="Understand"
            description="Gemini AI explains important risks, business impact, remediation, and potential attack paths."
          />

          <StepCard
            number="04"
            title="Monitor"
            description="Track security health over time with historical comparisons, reports, and alerts."
          />
        </div>
      </section>


      {/* ==================================================
          FEATURES
      ================================================== */}

      <section
         id="features"
         style={{
         marginBottom: "80px",
         scrollMarginTop: "90px",
         }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Platform Capabilities
          </p>

          <h2
            style={{
              fontSize: "32px",
              margin: "0",
            }}
          >
            Security Intelligence in One Platform
          </h2>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
          }}
        >
          <FeatureCard
            title="Vulnerability Scanning"
            description="Automatically assess authorized web applications and collect vulnerability findings."
          />

          <FeatureCard
            title="Vulnerability Intelligence"
            description="Normalize, deduplicate, categorize, correlate, and prioritize raw scanner findings."
          />

          <FeatureCard
            title="Security Health Score"
            description="Get a consolidated security health score based on the VIE risk assessment."
          />

          <FeatureCard
            title="AI Security Analysis"
            description="Use Gemini AI to generate security summaries, business impact, remediation guidance, and potential attack paths."
          />

          <FeatureCard
            title="Continuous Monitoring"
            description="Schedule recurring security assessments and detect changes between scans."
          />

          <FeatureCard
            title="Security Reports"
            description="Generate structured PDF security reports containing prioritized findings and remediation information."
          />
        </div>
      </section>


      {/* ==================================================
    ARCHITECTURE
================================================== */}

       <section
           id="security"
           style={{
           marginBottom: "80px",
           scrollMarginTop: "90px",
          }}
       >
        <div
          style={{
            background: "#171a21",
            border: "1px solid #292e38",
            borderRadius: "14px",
            padding: "36px 28px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <p
              style={{
                color: "#60a5fa",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Security Pipeline
            </p>

            <h2
              style={{
                fontSize: "30px",
                margin: "0",
              }}
            >
              From Raw Findings to Actionable Intelligence
            </h2>
          </div>


          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <PipelineItem text="Website" />

            <PipelineArrow />

            <PipelineItem text="OWASP ZAP" />

            <PipelineArrow />

            <PipelineItem text="VIE" />

            <PipelineArrow />

            <PipelineItem text="Gemini AI" />

            <PipelineArrow />

            <PipelineItem text="Reports & Alerts" />
          </div>
        </div>
      </section>


      {/* ==================================================
          CTA
      ================================================== */}

      <section
        style={{
          textAlign: "center",
          padding: "55px 24px",
          borderRadius: "14px",
          border: "1px solid #303642",
          background:
            "linear-gradient(180deg, #171a21 0%, #12151b 100%)",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            margin: "0 0 14px",
          }}
        >
          Ready to Secure Your Web Application?
        </h2>

        <p
          style={{
            color: "#9ca3af",
            maxWidth: "650px",
            margin: "0 auto 28px",
            lineHeight: "1.6",
          }}
        >
          Start an authorized security assessment and turn raw
          vulnerability findings into actionable security intelligence.
        </p>

        <a
          href="/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: "700",
          }}
        >
          Get Started with SecureWatch AI
        </a>
      </section>


      {/* ==================================================
          SECURITY NOTICE
      ================================================== */}

      <div
        style={{
          textAlign: "center",
          marginTop: "28px",
          color: "#6b7280",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        SecureWatch AI is intended for authorized security
        assessments only. Scan only web applications that you own
        or have explicit permission to test.
      </div>
    </div>
  );
}


// ======================================================
// STEP CARD
// ======================================================

function StepCard({
  number,
  title,
  description,
}) {
  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #292e38",
        background: "#171a21",
      }}
    >
      <div
        style={{
          color: "#60a5fa",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "14px",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          margin: "0 0 10px",
          fontSize: "20px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#9ca3af",
          lineHeight: "1.6",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}


// ======================================================
// FEATURE CARD
// ======================================================

function FeatureCard({
  title,
  description,
}) {
  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #292e38",
        background: "#171a21",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: "18px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#9ca3af",
          lineHeight: "1.6",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}


// ======================================================
// PIPELINE ITEM
// ======================================================

function PipelineItem({
  text,
}) {
  return (
    <div
      style={{
        padding: "11px 16px",
        borderRadius: "8px",
        border: "1px solid #303642",
        background: "#11141a",
        color: "#dbeafe",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      {text}
    </div>
  );
}


// ======================================================
// PIPELINE ARROW
// ======================================================

function PipelineArrow() {
  return (
    <span
      style={{
        color: "#4b5563",
        fontSize: "20px",
      }}
    >
      →
    </span>
  );
}


export default Home;