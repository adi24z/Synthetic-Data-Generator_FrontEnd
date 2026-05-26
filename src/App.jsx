import { useState } from "react";

function App() {
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState(100);
  const [email, setEmail] = useState("");

  const [dagRunId, setDagRunId] = useState("");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const progress =
    tasks.length === 0
      ? 0
      : (
          tasks.filter(
            (t) => t.state === "success"
          ).length /
          tasks.length
        ) * 100;

  const triggerPipeline = async () => {
    setError("");

    if (!keyword.trim()) {
      setError("Keyword is required");
      return;
    }

    if (keyword.trim().length < 3) {
      setError("Keyword must be at least 3 characters");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const rowCount = Number(rows);

    if (isNaN(rowCount)) {
      setError("Rows must be a number");
      return;
    }

    if (rowCount < 1) {
      setError("Rows must be greater than 0");
      return;
    }

    if (rowCount > 1000000) {
      setError("Maximum allowed rows is 1,000,000");
      return;
    }

    try {
      setLoading(true);
      setStatus("SUBMITTING");
      setTasks([]);
      setDagRunId("");

      const response = await fetch(
        "http://localhost:8000/generate-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword: keyword.trim(),
            rows: rowCount,
            email: email.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to trigger pipeline");
      }

      const data = await response.json();

      setDagRunId(data.dag_run_id);
      setStatus(data.state);

      pollTasks(data.dag_run_id);
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      setError("Failed to trigger pipeline");
      setLoading(false);
    }
  };

  const pollTasks = (runId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/task-status/${runId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch task status");
        }

        const data = await response.json();

        setTasks(data.task_instances);

        const allSuccess =
          data.task_instances.length > 0 &&
          data.task_instances.every(
            (task) => task.state === "success"
          );

        const anyFailed =
          data.task_instances.some(
            (task) => task.state === "failed"
          );

        if (allSuccess) {
          setStatus("SUCCESS");
          setLoading(false);
          clearInterval(interval);
        }

        if (anyFailed) {
          setStatus("FAILED");
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AI Synthetic Data Generator</h1>

      {error && (
        <div
          style={{
            padding: "10px",
            background: "#ffe5e5",
            border: "1px solid red",
            borderRadius: "5px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Keyword (e.g. Aircrafts)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
        }}
      />

      <input
        type="number"
        min="1"
        max="10000"
        placeholder="Rows"
        value={rows}
        onChange={(e) => setRows(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
        }}
      />

      <input
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={triggerPipeline}
        disabled={loading}
        style={{
          padding: "12px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? "Generating Dataset..."
          : "Generate Dataset"}
      </button>

      {dagRunId && (
        <>
          <hr />

          <h2>Job Information</h2>

          <strong>DAG Run ID</strong>
          <p
            style={{
              wordBreak: "break-word",
            }}
          >
            {dagRunId}
          </p>

          <strong>Status</strong>
          <p>{status}</p>

          <h2>Workflow Progress</h2>

          <div
            style={{
              width: "100%",
              height: "25px",
              background: "#ddd",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "green",
                transition: "width 0.5s ease",
              }}
            />
          </div>

          <p>{Math.round(progress)}%</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {tasks.map((task) => (
              <div
                key={task.task_id}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                {task.state === "success" && "✅ "}
                {task.state === "running" && "🔄 "}
                {task.state === "queued" && "⏳ "}
                {task.state === "failed" && "❌ "}

                <strong>{task.task_id}</strong>

                <div>
                  Status: {task.state}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;