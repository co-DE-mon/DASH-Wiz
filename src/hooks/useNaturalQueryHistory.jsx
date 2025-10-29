/**
 * useNaturalQueryHistory Hook
 * 
 * Manages history for Natural Query (AI-generated) queries
 * Separate from regular SQL query history for better organization
 */

import { useState, useCallback } from 'react';

const useNaturalQueryHistory = () => {
  const [naturalQueryHistory, setNaturalQueryHistory] = useState([]);

  /**
   * Add a new natural query to history
   * @param {string} question - The natural language question
   * @param {string} generatedSQL - The AI-generated SQL query
   * @param {Object} metadata - Additional metadata (execution time, success, etc.)
   */
  const addToHistory = useCallback((question, generatedSQL, metadata = {}) => {
    const historyItem = {
      id: `nq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      generatedSQL,
      timestamp: new Date().toLocaleString(),
      timestampISO: new Date().toISOString(),
      type: 'natural',
      ...metadata
    };

    setNaturalQueryHistory(prev => [historyItem, ...prev]);
    return historyItem;
  }, []);

  /**
   * Update a history item (e.g., after execution)
   * @param {string} id - History item ID
   * @param {Object} updates - Updates to apply
   */
  const updateHistoryItem = useCallback((id, updates) => {
    setNaturalQueryHistory(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }, []);

  /**
   * Remove an item from history
   * @param {string} id - History item ID
   */
  const removeFromHistory = useCallback((id) => {
    setNaturalQueryHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Clear all natural query history
   */
  const clearHistory = useCallback(() => {
    if (window.confirm('Clear all Natural Query history?')) {
      setNaturalQueryHistory([]);
      return true;
    }
    return false;
  }, []);

  /**
   * Search history by question or SQL content
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered history items
   */
  const searchHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return naturalQueryHistory;
    
    const term = searchTerm.toLowerCase();
    return naturalQueryHistory.filter(item =>
      item.question.toLowerCase().includes(term) ||
      item.generatedSQL.toLowerCase().includes(term)
    );
  }, [naturalQueryHistory]);

  /**
   * Get statistics about Natural Query usage
   * @returns {Object} Statistics
   */
  const getStats = useCallback(() => {
    const total = naturalQueryHistory.length;
    const successful = naturalQueryHistory.filter(item => item.success).length;
    const failed = naturalQueryHistory.filter(item => item.success === false).length;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0
    };
  }, [naturalQueryHistory]);

  return {
    naturalQueryHistory,
    addToHistory,
    updateHistoryItem,
    removeFromHistory,
    clearHistory,
    searchHistory,
    getStats
  };
};

export default useNaturalQueryHistory;

