import { useState } from "react";

export default function JobForm({ onJobCreated }) {
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState(1000);
  const [email, setEmail] = useState("");

  const submitJob = async (e) => {
    e.preventDefault();

    const response = await fetch(
      "http://localhost:8000/generate-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keyword,
          rows,
          email
        })
      }
    );

    const data = await response.json();

    onJobCreated(data);
  };

  return (
    <form onSubmit={submitJob}>
      <h2>Synthetic Data Generator</h2>

      <input
        placeholder="Keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        value={rows}
        onChange={(e) => setRows(Number(e.target.value))}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <button type="submit">
        Generate Dataset
      </button>
    </form>
  );
}