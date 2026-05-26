export default function StatusCard({
  dagRunId,
  status
}) {
  return (
    <div>
      <h3>Job Status</h3>

      <p>
        <strong>DAG Run ID:</strong>
        {dagRunId}
      </p>

      <p>
        <strong>Status:</strong>
        {status}
      </p>
    </div>
  );
}