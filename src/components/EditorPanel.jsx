import { lazy, Suspense, useState, useMemo, useEffect } from "react";
import {
  EditorSection,
  EditorFallback,
  EditorTabsBar,
  EditorTab,
  TabName,
  TabActions,
  TabCloseButton,
  NewTabButton,
  EditorToolbar,
  RunButton,
  SaveButton,
  QueryChangeNotification,
} from "../styles/AppStyles";
import QuerySelector from "./QuerySelector";
import NaturalQueryPanel from "./NaturalQueryPanel";
import { schemaToSQL } from "../utils/schemaExtractor";
import styled from "styled-components";

// Lazy load components
const SQLEditor = lazy(() => import("./SQLEditor"));

// Mode Toggle Button
const ModeToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${({ $active, theme }) => $active ? theme.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.text.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.primaryHover : theme.hover};
    border-color: ${({ theme }) => theme.primary};
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const ModeToggleGroup = styled.div`
  display: flex;
  gap: 6px;
  margin-right: 8px;
  padding: 4px;
  background: ${({ theme }) => theme.hover};
  border-radius: 8px;
`;

const NaturalModeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.isDarkMode 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))' 
    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))'};
  border: 1px solid ${({ theme }) => theme.primary};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

function EditorPanel({
  isFullScreen,
  layoutDirection,
  splitSize,
  results,
  outputTabs,
  activePanel,
  queryTabs,
  activeTabId,
  editingTabId,
  newTabName,
  tabInputRef,
  predefinedQueries,
  currentQueryId,
  queryText,
  queryModified,
  setActiveTabId,
  closeTab,
  handleTabDoubleClick,
  handleTabRename,
  handleRenameBlur,
  handleRenameKeyDown,
  addNewTab,
  handleQueryChange,
  openSaveQueryDialog,
  handleExecuteQuery,
  setNewTabName,
  setQueryText,
}) {
  // State for Natural Query mode
  const [editorMode, setEditorMode] = useState('sql'); // 'sql' or 'natural'
  const [naturalQueryText, setNaturalQueryText] = useState('');

  // Generate schema SQL from current schema; examples removed so default to empty
  const schemaSQL = useMemo(() => {
    return schemaToSQL({ databases: [] });
  }, []);

  // Handle mode toggle
  const toggleMode = (mode) => {
    setEditorMode(mode);
  };

  // Handle Natural Query generation complete
  const handleNaturalQueryGenerate = (generatedSQL, question) => {
    setNaturalQueryText(question);
    // Automatically populate the SQL editor and switch to SQL mode
    if (generatedSQL) {
      setQueryText(generatedSQL);
      setEditorMode('sql');
    }
    // Store for history tracking
    console.log('Generated SQL:', generatedSQL, 'for question:', question);
  };

  // Handle "Use This Query" button from Natural Query Panel
  const handleUseQuery = (generatedSQL, question) => {
    // Switch back to SQL mode
    setEditorMode('sql');
    
    // Update the current tab with the generated SQL
    // Note: You may want to add logic to match against predefined queries
    // or create a new query type for AI-generated queries
    
    // For now, we'll execute it directly as a custom query
    // In production, you might want to add it to the editor for review first
    handleExecuteQuery(generatedSQL);
    
    // Optionally show a notification
    console.log('Using AI-generated query:', generatedSQL);
  };

  // Add keyboard shortcut for mode toggle (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setEditorMode(prev => prev === 'sql' ? 'natural' : 'sql');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <EditorSection
      $fullHeight={
        (activePanel === "editor-panel" && layoutDirection === "tabbed") ||
        outputTabs.length === 0
      }
      role="tabpanel"
      id="editor-panel"
      style={{
        display:
          (activePanel === "editor-panel" || layoutDirection !== "tabbed") &&
          !isFullScreen
            ? "flex"
            : "none",
        flex: layoutDirection === "vertical" ? "1 0 auto" : "0 0 auto",
        height:
          layoutDirection === "vertical"
            ? results && outputTabs.length > 0
              ? `${splitSize}%`
              : "100%"
            : "100%",
        width:
          layoutDirection === "horizontal"
            ? results && outputTabs.length > 0
              ? `${splitSize}%`
              : "100%"
            : "100%",
        position: "relative",
      }}
    >
      <EditorTabsBar>
        {queryTabs.map((tab) => (
          <EditorTab
            key={tab.id}
            $active={tab.id === activeTabId}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => handleTabDoubleClick(tab.id, tab.name)}
            title={`${tab.name} (Double-click to rename)`}
          >
            {editingTabId === tab.id ? (
              <form onSubmit={handleTabRename} style={{ display: "inline" }}>
                <input
                  ref={tabInputRef}
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onBlur={handleRenameBlur}
                  onKeyDown={handleRenameKeyDown}
                  style={{
                    width: "120px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid",
                    color: "inherit",
                    fontSize: "inherit",
                    padding: "0 2px",
                    outline: "none",
                  }}
                />
              </form>
            ) : (
              <TabName title={tab.name} $renamed={tab.renamed}>
                {tab.name}
              </TabName>
            )}
            <TabActions>
              <TabCloseButton
                onClick={(e) => closeTab(tab.id, e)}
                title="Close tab"
              >
                ×
              </TabCloseButton>
            </TabActions>
          </EditorTab>
        ))}
        <NewTabButton onClick={addNewTab} title="New query tab">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4v16m-8-8h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </NewTabButton>
      </EditorTabsBar>

      {/* Editor Toolbar */}
      <EditorToolbar>
        {/* Mode Toggle */}
        <ModeToggleGroup>
          <ModeToggleButton 
            $active={editorMode === 'sql'} 
            onClick={() => toggleMode('sql')}
            title="SQL Editor Mode"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 4v16M4 15h16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            SQL
          </ModeToggleButton>
          <ModeToggleButton 
            $active={editorMode === 'natural'} 
            onClick={() => toggleMode('natural')}
            title="Natural Query Mode (Ctrl+K)"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Natural Query
          </ModeToggleButton>
        </ModeToggleGroup>

        {editorMode === 'sql' ? (
          <>
            <QuerySelector
              queries={predefinedQueries}
              currentQuery={currentQueryId}
              onQueryChange={handleQueryChange}
            />

            {queryModified && (
              <QueryChangeNotification>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8v4m0 4h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Click "Run SQL" to execute the new query
              </QueryChangeNotification>
            )}

            <SaveButton
              onClick={openSaveQueryDialog}
              title="Save this query"
              style={{ marginLeft: "auto", marginRight: "8px" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 21v-8H7v8M7 3v5h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Save</span>
            </SaveButton>

            <RunButton onClick={() => handleExecuteQuery(queryText)}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
              </svg>
              Run SQL
            </RunButton>
          </>
        ) : (
          <NaturalModeIndicator>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            AI-Powered Natural Query Mode Active
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8 }}>
              Press Ctrl+K to toggle
            </span>
          </NaturalModeIndicator>
        )}
      </EditorToolbar>

      {/* Content Area - SQL Editor or Natural Query Panel */}
      {editorMode === 'sql' ? (
        <Suspense fallback={<EditorFallback>Loading editor...</EditorFallback>}>
          <SQLEditor
            onExecuteQuery={handleExecuteQuery}
            initialQuery={queryText}
            style={{ flex: 1 }}
          />
        </Suspense>
      ) : (
        <NaturalQueryPanel
          schema={schemaSQL}
          onUseQuery={handleUseQuery}
          onGenerateComplete={handleNaturalQueryGenerate}
        />
      )}
    </EditorSection>
  );
}

export default EditorPanel;