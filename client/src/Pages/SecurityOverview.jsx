import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../Services/api";

import SecurityHealthScore from "../Components/SecurityHealthScore";
import VulnerabilityDetail from "../Components/VulnerabilityDetail";

function SecurityOverview() {
  const { scanId } = useParams();
  const navigate = useNavigate();

  const [intelligence, setIntelligence] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    severityFilter,
    setSeverityFilter
  ] = useState("All");

  const [
    categoryFilter,
    setCategoryFilter
  ] = useState("All");

  const [
    selectedFinding,
    setSelectedFinding
  ] = useState(null);

  // --------------------------------------------------
  // Vulnerability AI state
  // --------------------------------------------------

  const [
    vulnerabilityAIAnalysis,
    setVulnerabilityAIAnalysis
  ] = useState(null);

  const [
    vulnerabilityAILoading,
    setVulnerabilityAILoading
  ] = useState(false);

  const [
    vulnerabilityAIError,
    setVulnerabilityAIError
  ] = useState("");

  // --------------------------------------------------
  // Prevent duplicate intelligence requests
  // --------------------------------------------------

  const requestedScanRef =
    useRef(null);


  // --------------------------------------------------
  // Generate stable vulnerability identity
  // --------------------------------------------------

  const getFindingKey = (
    finding
  ) => {

    if (finding.findingId) {

      return `id:${finding.findingId}`;

    }

    return [

      finding.title ||
        finding.name ||
        finding.alert ||
        "",

      finding.url ||
        "",

      finding.method ||
        "",

      finding.parameter ||
        "",

    ]

      .map((value) =>
        String(value)
          .toLowerCase()
          .trim()
      )

      .join("|");

  };


  // --------------------------------------------------
  // Fetch Security Intelligence
  // --------------------------------------------------

  useEffect(() => {

    if (!scanId) {
      return;
    }


    // ----------------------------------------------
    // Prevent duplicate request for same scan
    // ----------------------------------------------

    if (
      requestedScanRef.current ===
      scanId
    ) {
      return;
    }


    requestedScanRef.current =
      scanId;


    const fetchIntelligence =
      async () => {

        try {

          setLoading(true);

          setError("");


          console.log(
            `Loading security intelligence for scan ${scanId}`
          );


          const response =
            await api.get(
              `/scans/${scanId}/intelligence`
            );


          setIntelligence(
            response.data
          );


        } catch (error) {

          console.error(
            "Failed to fetch intelligence:",
            error
          );


          // ------------------------------------------
          // Allow retry if request failed
          // ------------------------------------------

          requestedScanRef.current =
            null;


          setError(
            error.response?.data?.message ||
              "Failed to load security intelligence"
          );


        } finally {

          setLoading(false);

        }

      };


    fetchIntelligence();


  }, [scanId]);


  // --------------------------------------------------
  // Analyze Individual Vulnerability With AI
  // --------------------------------------------------

  const handleAnalyzeVulnerabilityAI =
    async (finding) => {

      try {

        setVulnerabilityAILoading(
          true
        );

        setVulnerabilityAIError(
          ""
        );

        setVulnerabilityAIAnalysis(
          null
        );


        const findingKey =
          getFindingKey(
            finding
          );


        console.log(
          "Requesting vulnerability AI analysis:",
          {
            scanId,
            findingKey,
            title:
              finding.title ||
              finding.name ||
              finding.alert,
          }
        );


        const response =
          await api.post(
            "/ai/vulnerabilities/analyze",
            {
              scanId,

              findingKey,

              title:
                finding.title ||
                finding.name ||
                finding.alert ||
                "Unknown Vulnerability",

              category:
                finding.category ||
                "Other",

              severity:
                finding.severity ||
                "Not available",

              priority:
                finding.priority ||
                "Not available",

              priorityScore:
                finding.priorityScore ??
                null,

              confidence:
                finding.confidence ||
                "Not available",

              occurrences:
                finding.occurrences ??
                null,

              url:
                finding.url ||
                "Not available",

              method:
                finding.method ||
                "Not available",

              parameter:
                finding.parameter ||
                "Not available",

              description:
                finding.description ||
                "Not available",

              evidence:
                finding.evidence ||
                "Not available",

              solution:
                finding.solution ||
                "Not available",
            }
          );


        console.log(
          "Vulnerability AI response:",
          response.data
        );


        setVulnerabilityAIAnalysis(
          response.data
        );


      } catch (error) {

        console.error(
          "Failed to analyze vulnerability with AI:",
          error
        );


        setVulnerabilityAIError(
          error.response?.data?.message ||
            "Failed to analyze vulnerability with AI"
        );


      } finally {

        setVulnerabilityAILoading(
          false
        );

      }

    };


  // --------------------------------------------------
  // Group Findings
  // --------------------------------------------------

  const groupedFindings = useMemo(() => {

    const findings =
      intelligence?.findings || [];

    const newFindings =
      intelligence?.newFindings || [];


    const getFindingKey = (
      finding
    ) => {

      if (finding.findingId) {

        return `id:${finding.findingId}`;

      }


      return [

        finding.title ||
          finding.name ||
          finding.alert ||
          "",

        finding.url ||
          "",

        finding.method ||
          "",

        finding.parameter ||
          "",

      ]

        .map((value) =>
          String(value)
            .toLowerCase()
            .trim()
        )

        .join("|");

    };


    /*
     * Exact IDs/fingerprints of NEW findings
     */

    const newFindingKeys =
      new Set(
        newFindings.map(
          getFindingKey
        )
      );


    const groups =
      new Map();


    for (
      const finding
      of findings
    ) {

      const title = (
        finding.title ||
        finding.name ||
        finding.alert ||
        "Unknown Vulnerability"
      ).trim();


      const category =
        finding.category ||
        "Other";


      const findingKey =
        getFindingKey(
          finding
        );


      const isNew =
        newFindingKeys.has(
          findingKey
        );


      /*
       * IMPORTANT:
       *
       * If this is a NEW finding,
       * keep it as a separate row.
       *
       * This prevents two new findings
       * with the same title from being
       * merged.
       */

      const groupKey =
        `${title.toLowerCase()}|${category.toLowerCase()}`;


      if (!groups.has(groupKey)) {

        groups.set(
          groupKey,
          {

            ...finding,

            title,

            category,

            occurrences: 0,

            affectedEndpoints: [],

            isNew: false,

            newFinding: null,

          }
        );

      }


      const group =
        groups.get(
          groupKey
        );


      /*
       * Count occurrences
       */

      group.occurrences +=
        finding.occurrences || 1;


      /*
       * Store affected endpoints
       */

      if (finding.url) {

        if (
          !group.affectedEndpoints.includes(
            finding.url
          )
        ) {

          group.affectedEndpoints.push(
            finding.url
          );

        }

      }


      /*
       * Mark exact NEW finding
       */

      if (isNew) {

        group.isNew = true;

        group.newFinding =
          finding;

      }


      /*
       * Keep highest priority information
       */

      if (
        (finding.priorityScore || 0) >
        (group.priorityScore || 0)
      ) {

        group.severity =
          finding.severity ||
          group.severity;


        group.priority =
          finding.priority ||
          group.priority;


        group.priorityScore =
          finding.priorityScore ||
          group.priorityScore;


        group.confidence =
          finding.confidence ||
          group.confidence;


        group.description =
          finding.description ||
          group.description;


        group.solution =
          finding.solution ||
          group.solution;


        group.evidence =
          finding.evidence ||
          group.evidence;


        group.url =
          finding.url ||
          group.url;


        group.method =
          finding.method ||
          group.method;


        group.parameter =
          finding.parameter ||
          group.parameter;

      }

    }


    return Array.from(
      groups.values()
    );

  }, [intelligence]);


  // --------------------------------------------------
  // Apply Filters
  // --------------------------------------------------

  const filteredFindings =
    useMemo(() => {

      let result =
        [...groupedFindings];


      if (
        severityFilter !==
        "All"
      ) {

        result =
          result.filter(
            (finding) =>
              finding.priority ===
                severityFilter ||
              finding.severity ===
                severityFilter
          );

      }


      if (
        categoryFilter !==
        "All"
      ) {

        result =
          result.filter(
            (finding) =>
              finding.category ===
              categoryFilter
          );

      }


      /*
       * Highest priority first
       */

      result.sort(
        (a, b) =>
          (b.priorityScore || 0) -
          (a.priorityScore || 0)
      );


      return result;

    }, [
      groupedFindings,
      severityFilter,
      categoryFilter,
    ]);


  // --------------------------------------------------
  // Categories
  // --------------------------------------------------

  const categories =
    useMemo(() => {

      return [
        "All",

        ...new Set(
          groupedFindings.map(
            (finding) =>
              finding.category
          )
        ),

      ];

    }, [
      groupedFindings
    ]);


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {

    return (
      <div className="security-page">

        <h1>
          Security Intelligence
        </h1>

        <p>
          Analyzing scan results...
        </p>

      </div>
    );

  }


  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {

    return (
      <div className="security-page">

        <h1>
          Security Intelligence
        </h1>

        <p>
          {error}
        </p>

      </div>
    );

  }


  // --------------------------------------------------
  // No Intelligence
  // --------------------------------------------------

  if (!intelligence) {

    return (
      <div className="security-page">

        <h1>
          Security Intelligence
        </h1>

        <p>
          No intelligence data available.
        </p>

      </div>
    );

  }


  const summary =
    intelligence.summary || {};


  const changes =
    intelligence.changes || {};


  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (

    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div
        style={{
          marginBottom: "32px",
        }}
      >

        <h1
          style={{
            fontSize: "36px",
            marginBottom: "8px",
          }}
        >
          Security Intelligence
        </h1>


        <p>
          Security analysis for scan{" "}
          <strong>
            {scanId}
          </strong>
        </p>


        <button
          className="primary-button"
          onClick={() =>
            navigate(
              `/scans/${scanId}/ai`
            )
          }
        >
          🤖 AI Security Analysis
        </button>

      </div>


      {/* ==================================================
          SECURITY HEALTH SCORE
      ================================================== */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >

        <SecurityHealthScore
          score={
            intelligence.healthScore
          }
          status={
            intelligence.healthStatus
          }
        />

      </div>


      {/* ==================================================
          SECURITY OVERVIEW
      ================================================== */}

      <section
        style={{
          marginBottom: "32px",
        }}
      >

        <h2>
          Security Overview
        </h2>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >

          <SummaryCard
            label="Critical"
            value={
              summary.critical || 0
            }
          />


          <SummaryCard
            label="High"
            value={
              summary.high || 0
            }
          />


          <SummaryCard
            label="Medium"
            value={
              summary.medium || 0
            }
          />


          <SummaryCard
            label="Low"
            value={
              summary.low || 0
            }
          />


          <SummaryCard
            label="Informational"
            value={
              summary.informational ||
              0
            }
          />

        </div>

      </section>


      {/* ==================================================
          SCAN CHANGES
      ================================================== */}

      <section
        style={{
          marginBottom: "32px",
        }}
      >

        <h2>
          Scan Changes
        </h2>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >

          <SummaryCard
            label="New"
            value={
              changes.new || 0
            }
          />


          <SummaryCard
            label="Resolved"
            value={
              changes.resolved || 0
            }
          />


          <SummaryCard
            label="Persistent"
            value={
              changes.persistent ||
              0
            }
          />

        </div>

      </section>


      {/* ==================================================
          VULNERABILITY INTELLIGENCE
      ================================================== */}

      <section>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >

          <div>

            <h2>
              Vulnerability Intelligence
            </h2>


            <p>

              {groupedFindings.length}{" "}
              unique vulnerabilities
              from{" "}

              {
                intelligence.findings
                  ?.length || 0
              }

              {" "}findings

            </p>

          </div>


          {/* ==================================================
              FILTERS
          ================================================== */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <select
              value={
                severityFilter
              }
              onChange={(event) =>
                setSeverityFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Priorities
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

              <option value="Informational">
                Informational
              </option>

            </select>


            <select
              value={
                categoryFilter
              }
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >

              {categories.map(
                (category) => (

                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* ==================================================
            VULNERABILITY TABLE
        ================================================== */}

        <div
          style={{
            overflowX: "auto",
            marginTop: "20px",
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth: "850px",
            }}
          >

            <thead>

              <tr>

                <th>
                  Vulnerability
                </th>

                <th>
                  Category
                </th>

                <th>
                  Severity
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Score
                </th>

                <th>
                  Affected
                </th>

                <th>
                  Details
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredFindings.map(
                (
                  finding,
                  index
                ) => (

                  <tr
                    key={`${finding.title}-${index}`}
                    className={
                      finding.isNew
                        ? "new-vulnerability-row"
                        : ""
                    }
                  >

                    <td>

                      <div className="vulnerability-name-cell">

                        <strong>
                          {finding.title}
                        </strong>


                        {finding.isNew && (

                          <span className="new-vulnerability-badge">
                            🆕 NEW
                          </span>

                        )}

                      </div>

                    </td>


                    <td>
                      {finding.category}
                    </td>


                    <td>
                      {finding.severity ||
                        "Unknown"}
                    </td>


                    <td>
                      {finding.priority ||
                        "Unknown"}
                    </td>


                    <td>
                      {finding.priorityScore ??
                        "-"}
                    </td>


                    <td>
                      {
                        finding
                          .affectedEndpoints
                          .length
                      }
                    </td>


                    <td>

                      <button
                        type="button"
                        className="vulnerability-view-button"
                        onClick={() =>
                          setSelectedFinding(
                            finding
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        {/* ==================================================
            NO RESULTS
        ================================================== */}

        {filteredFindings.length ===
          0 && (

          <p
            style={{
              marginTop: "24px",
            }}
          >
            No vulnerabilities match
            the selected filters.
          </p>

        )}

      </section>


      {/* ==================================================
          CORRELATED ATTACK CHAINS
      ================================================== */}

      <section
        style={{
          marginTop: "48px",
        }}
      >

        <h2>
          Correlated Attack Chains
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "#858c99",
            lineHeight: "1.6",
          }}
        >
          Attack chains identified through deterministic
          correlation of related vulnerability findings.
        </p>


        {intelligence.correlations
          ?.length > 0 ? (

          intelligence.correlations.map(
            (
              correlation,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #333",
                  borderRadius:
                    "10px",
                  padding: "20px",
                  marginTop:
                    "16px",
                }}
              >

                <h3>
                  {correlation.title}
                </h3>


                <p>
                  {
                    correlation.description
                  }
                </p>


                <p>

                  <strong>
                    Severity:
                  </strong>{" "}

                  {
                    correlation.severity
                  }

                </p>

              </div>

            )
          )

        ) : (

          <div
            style={{
              marginTop: "16px",
              padding: "18px 20px",
              border:
                "1px solid #292e38",
              borderRadius: "10px",
              background: "#171a21",
            }}
          >

            <p
              style={{
                margin: 0,
                color: "#c7ccd5",
              }}
            >
              No correlated attack chains were
              identified from the available
              vulnerability findings.
            </p>

            <p
              style={{
                margin:
                  "10px 0 0",
                color: "#858c99",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              AI Security Analysis may identify
              additional hypothetical attack paths
              through AI-assisted security reasoning.
            </p>

          </div>

        )}

      </section>


      {/* ==================================================
          VULNERABILITY DETAIL PANEL
      ================================================== */}

      {selectedFinding && (

        <VulnerabilityDetail

          finding={
            selectedFinding.newFinding ||
            selectedFinding
          }

          onClose={() => {

            setSelectedFinding(
              null
            );

            setVulnerabilityAIAnalysis(
              null
            );

            setVulnerabilityAIError(
              ""
            );

          }}

          onAnalyzeAI={
            handleAnalyzeVulnerabilityAI
          }

          vulnerabilityAIAnalysis={
            vulnerabilityAIAnalysis
          }

          vulnerabilityAILoading={
            vulnerabilityAILoading
          }

          vulnerabilityAIError={
            vulnerabilityAIError
          }

        />

      )}

    </div>

  );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
}) {

  return (

    <div
      style={{
        border:
          "1px solid #333",
        borderRadius: "12px",
        padding: "20px",
        background:
          "#171a21",
      }}
    >

      <p
        style={{
          margin: 0,
          opacity: 0.7,
        }}
      >
        {label}
      </p>


      <h3
        style={{
          fontSize: "30px",
          margin:
            "8px 0 0",
        }}
      >
        {value}
      </h3>

    </div>

  );
}


export default SecurityOverview;