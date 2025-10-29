/**
 * Natural Query History Component
 * 
 * Displays history of Natural Query (AI-generated) queries
 * Shows questions, generated SQL, and execution results
 */

import { memo } from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))' 
    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))'};
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: ${({ theme }) => theme.primary};
  }
`;

const ClearButton = styled.button`
  padding: 4px 8px;
  background: transparent;
  color: ${({ theme }) => theme.text.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    border-color: ${({ theme }) => theme.error};
    color: ${({ theme }) => theme.error};
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 20px;
  }
`;

const HistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s;
  gap: 8px;

  &:hover {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const QuestionText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.primary};
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 6px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.primary};
  }
`;

const SQLPreview = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 2px solid ${({ theme }) => theme.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Timestamp = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.text.disabled};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $status, theme }) => 
    $status === 'success' ? 'rgba(34, 197, 94, 0.2)' :
    $status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
  color: ${({ $status }) => 
    $status === 'success' ? '#22c55e' :
    $status === 'error' ? '#ef4444' : '#9ca3af'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  background: transparent;
  color: ${({ theme }) => theme.text.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${({ theme }) => theme.hover};
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  height: 100%;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.6;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.primary};
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 8px 12px;
  background: ${({ theme }) => theme.surface};
  border-top: 1px solid ${({ theme }) => theme.border};
  font-size: 11px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .label {
    color: ${({ theme }) => theme.text.disabled};
  }

  .value {
    color: ${({ theme }) => theme.text.primary};
    font-weight: 600;
    font-size: 13px;
  }
`;

const NaturalQueryHistory = memo(({ 
  history = [], 
  onSelect,
  onRerun,
  onClear,
  stats
}) => {
  if (!history.length) {
    return (
      <HistoryContainer>
        <HistoryHeader>
          <HeaderTitle>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Natural Query History
          </HeaderTitle>
        </HistoryHeader>
        <EmptyState>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>No Natural Query history yet</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: '0.8' }}>
            Use Natural Query mode to generate SQL from questions
          </div>
        </EmptyState>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HeaderTitle>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Natural Query History ({history.length})
        </HeaderTitle>
        {onClear && (
          <ClearButton onClick={onClear}>
            Clear All
          </ClearButton>
        )}
      </HistoryHeader>

      <HistoryList>
        {history.map((item) => (
          <HistoryItem key={item.id} onClick={() => onSelect && onSelect(item)}>
            <QuestionText>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.question}
            </QuestionText>
            
            <SQLPreview title={item.generatedSQL}>
              {item.generatedSQL}
            </SQLPreview>

            <Timestamp>
              {item.timestamp}
              {item.success !== undefined && (
                <StatusBadge $status={item.success ? 'success' : 'error'}>
                  {item.success ? 'Success' : 'Failed'}
                </StatusBadge>
              )}
              {item.executionTime && <span>· {item.executionTime}</span>}
              {item.rowCount !== undefined && <span>· {item.rowCount} rows</span>}
            </Timestamp>

            <ActionButtons onClick={(e) => e.stopPropagation()}>
              <ActionButton onClick={() => onSelect && onSelect(item)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copy SQL
              </ActionButton>
              {onRerun && (
                <ActionButton onClick={() => onRerun(item)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                  </svg>
                  Run Again
                </ActionButton>
              )}
            </ActionButtons>
          </HistoryItem>
        ))}
      </HistoryList>

      {stats && (
        <StatsBar>
          <StatItem>
            <span className="label">Total</span>
            <span className="value">{stats.total}</span>
          </StatItem>
          <StatItem>
            <span className="label">Success</span>
            <span className="value" style={{ color: '#22c55e' }}>{stats.successful}</span>
          </StatItem>
          <StatItem>
            <span className="label">Failed</span>
            <span className="value" style={{ color: '#ef4444' }}>{stats.failed}</span>
          </StatItem>
          <StatItem>
            <span className="label">Success Rate</span>
            <span className="value">{stats.successRate}%</span>
          </StatItem>
        </StatsBar>
      )}
    </HistoryContainer>
  );
});

export default NaturalQueryHistory;

