import { useState, useCallback } from "react";

function useSQLQuery() {
  // State for managing query execution
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  // Format date utility function
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Clear history function
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
  }, []);

  // Execute query function
  const executeQuery = useCallback((query, queryId, tabName, onComplete) => {
    // Reset error state
    setError(null);

    // Validate query
    if (!query?.trim()) {
      setError("Query cannot be empty");
      return;
    }

    if (!queryId) {
      setError("Query ID is required");
      return;
    }

    setLoading(true);

    // Simulate query execution time (between 200ms and 1000ms)
    const executionDelay = Math.floor(Math.random() * 800) + 200;

    // Execute after delay
    const timer = setTimeout(() => {
      try {
        // Example/mock data were removed; this hook no longer returns sample results.
        // By default, return an empty result set so UI can operate without example data.
        const queryResult = [];

        setResults(queryResult);

        // Set execution time
        const time = (executionDelay / 1000).toFixed(3);
        const timeFormatted = `${time}s`;
        setExecutionTime(timeFormatted);

        // Add to history (rowCount = 0 since no sample data)
        const historyItem = {
          id: Date.now(),
          query,
          queryId,
          tabName,
          timestamp: formatDate(new Date()),
          executionTime: timeFormatted,
          rowCount: 0,
        };

        setQueryHistory((prev) => [historyItem, ...prev]);

        // Call the callback with results if provided
        if (onComplete) {
          onComplete(queryResult);
        }
      } catch (err) {
        console.error("Error executing query:", err);
        setError(err.message || "An error occurred while executing the query");
        setResults(null);

        // Call the callback with null to indicate error
        if (onComplete) {
          onComplete(null);
        }
      } finally {
        setLoading(false);
      }
    }, executionDelay);

    // Cleanup function
    return () => clearTimeout(timer);
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setExecutionTime(null);
    setError(null);
  }, []);

  // Select a query from history
  const selectFromHistory = useCallback(
    (historyItem) => {
      if (historyItem) {
        executeQuery(
          historyItem.query,
          historyItem.queryId,
          historyItem.tabName
        );
      }
    },
    [executeQuery]
  );

  return {
    results,
    loading,
    error,
    executionTime,
    queryHistory,
    executeQuery,
    clearHistory,
    clearResults,
    selectFromHistory,
  };
}

export default useSQLQuery;