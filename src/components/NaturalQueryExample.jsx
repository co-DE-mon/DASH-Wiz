/**
 * Example Component: Natural Query Interface
 * 
 * This is a reference implementation showing how to integrate
 * the Natural-SQL API service into your DASH-Wiz components.
 * 
 * You can use this as a starting point for Phase 2 implementation.
 */

import { useState, useEffect } from 'react';
import { generateSQL, checkHealth, APIError } from '../services/api';

const NaturalQueryExample = () => {
  const [schema, setSchema] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await checkHealth();
        setBackendStatus('healthy');
      } catch (error) {
        setBackendStatus('unhealthy');
        console.error('Backend health check failed:', error);
      }
    };

    checkBackendHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateSQL = async (e) => {
    e.preventDefault();
    
    if (!schema || !question) {
      setError('Please provide both schema and question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateSQL(schema, question);
      setResult(response);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(`Error: ${err.message}`);
      }
      console.error('Failed to generate SQL:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'healthy': return '#22c55e';
      case 'unhealthy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Natural Query Interface (Example)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
            }}
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Backend: {backendStatus}
          </span>
        </div>
      </div>

      <form onSubmit={handleGenerateSQL}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Database Schema
          </label>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="Example:&#10;CREATE TABLE users (&#10;  id INT PRIMARY KEY,&#10;  name VARCHAR(100),&#10;  email VARCHAR(100)&#10;);"
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Your Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Show me all users with gmail addresses"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || backendStatus !== 'healthy'}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || backendStatus !== 'healthy' ? '#d1d5db' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading || backendStatus !== 'healthy' ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating SQL...' : 'Generate SQL Query'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '12px' }}>Generated SQL Query:</h3>
          <pre
            style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          >
            {result.sql_query}
          </pre>

          {result.data && result.data.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4>Results ({result.rowCount} rows):</h4>
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '8px',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '8px',
                            textAlign: 'left',
                            borderBottom: '2px solid #d1d5db',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, idx) => (
                      <tr key={idx}>
                        {result.columns.map((col) => (
                          <td
                            key={col}
                            style={{
                              padding: '8px',
                              borderBottom: '1px solid #e5e7eb',
                            }}
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NaturalQueryExample;

