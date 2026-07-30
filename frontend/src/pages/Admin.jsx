import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Admin() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    client.get('/analytics/summary').then((res) => setSummary(res.data))
  }, [])

  if (!summary) return <p>Loading...</p>

  return (
    <div>
      <h1>Clickstream Activity</h1>

      <h2>Counts by event type</h2>
      <ul>
        {Object.entries(summary.counts_by_type).map(([type, count]) => (
          <li key={type}>
            {type}: {count}
          </li>
        ))}
      </ul>

      <h2>Most recent events</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>User</th>
            <th>Payload</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {summary.recent_events.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.event_type}</td>
              <td>{e.user_id}</td>
              <td>{JSON.stringify(e.payload)}</td>
              <td>{e.server_timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
