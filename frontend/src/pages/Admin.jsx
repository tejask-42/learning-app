import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Admin() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    client.get('/analytics/summary').then((res) => setSummary(res.data))
  }, [])

  if (!summary) return <p className="loading">Loading...</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clickstream activity</h1>
        <p>Live counts of every tracked interaction, straight from the events table.</p>
      </div>

      <div className="stat-grid">
        {Object.entries(summary.counts_by_type).map(([type, count]) => (
          <div key={type} className="stat-tile">
            <span className="stat-tile-value">{count}</span>
            <span className="stat-tile-label">{type}</span>
          </div>
        ))}
      </div>

      <div className="stack">
        <h2>Most recent events</h2>
        <div className="table-wrap">
          <table>
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
                  <td className="payload-cell">{JSON.stringify(e.payload)}</td>
                  <td>{e.server_timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
