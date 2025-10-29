import { lazy, Suspense } from "react";
import {
  Sidebar as SidebarContainer,
  SidebarSections,
  SidebarTabs,
  SidebarTab,
  SidebarContent,
  SidebarResizeHandle,
  LoadingFallback,
} from "../styles/AppStyles";

// Lazy load components
const DatabaseExplorer = lazy(() => import("./DatabaseExplorer"));
const QueryHistory = lazy(() => import("./QueryHistory"));
const NaturalQueryHistory = lazy(() => import("./NaturalQueryHistory"));

function Sidebar({
  sidebarWidth,
  sidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  handleSidebarResizeStart,
  sidebarResizeRef,
  handleTableClick,
  queryHistory,
  handleHistorySelect,
  naturalQueryHistory,
  naturalQueryStats,
  handleNaturalQuerySelect,
  handleNaturalQueryRerun,
  handleNaturalQueryClear,
}) {
  return (
    <SidebarContainer $width={`${sidebarWidth}px`} $isOpen={sidebarOpen}>
      <SidebarSections>
        <SidebarTabs>
          <SidebarTab
            $active={activeSidebarTab === "explorer"}
            onClick={() => setActiveSidebarTab("explorer")}
          >
            Database Schema
          </SidebarTab>
          <SidebarTab
            $active={activeSidebarTab === "history"}
            onClick={() => setActiveSidebarTab("history")}
          >
            Query History
          </SidebarTab>
          <SidebarTab
            $active={activeSidebarTab === "natural-history"}
            onClick={() => setActiveSidebarTab("natural-history")}
            title="Natural Query History (AI-Generated)"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Natural Query
            </span>
          </SidebarTab>
        </SidebarTabs>

        <SidebarContent $active={activeSidebarTab === "explorer"}>
          <Suspense
            fallback={<LoadingFallback>Loading explorer...</LoadingFallback>}
          >
            <DatabaseExplorer schemaOnly onTableClick={handleTableClick} />
          </Suspense>
        </SidebarContent>

        <SidebarContent $active={activeSidebarTab === "history"}>
          <Suspense
            fallback={<LoadingFallback>Loading history...</LoadingFallback>}
          >
            <QueryHistory
              history={queryHistory}
              onSelect={handleHistorySelect}
            />
          </Suspense>
        </SidebarContent>

        <SidebarContent $active={activeSidebarTab === "natural-history"}>
          <Suspense
            fallback={<LoadingFallback>Loading Natural Query history...</LoadingFallback>}
          >
            <NaturalQueryHistory
              history={naturalQueryHistory}
              stats={naturalQueryStats}
              onSelect={handleNaturalQuerySelect}
              onRerun={handleNaturalQueryRerun}
              onClear={handleNaturalQueryClear}
            />
          </Suspense>
        </SidebarContent>
      </SidebarSections>

      {/* Add resize handle for sidebar */}
      <SidebarResizeHandle
        onMouseDown={handleSidebarResizeStart}
        ref={sidebarResizeRef}
      />
    </SidebarContainer>
  );
}

export default Sidebar;
