import { useMemo, useState } from 'react';
import styled from 'styled-components';
import useSchemaStore, { validateSchema } from '../hooks/useSchemaStore';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const Modal = styled.div`
  width: 960px;
  max-width: 95%;
  max-height: 90vh;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Title = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Body = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
  height: 100%;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 320px;
  overflow: hidden;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 380px;
  overflow: hidden;
`;

const Tabs = styled.div`
  display: flex;
  gap: 6px;
`;

const Tab = styled.button`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ $active, theme }) => $active ? theme.hover : 'transparent'};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
`;

const Section = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  padding: 10px 12px;
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const SectionBody = styled.div`
  padding: 10px;
  overflow: auto;
  display: flex;
  gap: 10px;
  flex: 1;
`;

const List = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 8px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

const Small = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.disabled};
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surfaceAlt || 'transparent'};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
`;

const Danger = styled(Button)`
  color: #ef4444;
  border-color: rgba(239,68,68,0.5);
`;

const Footer = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 260px;
  resize: vertical;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.isDarkMode ? '#1e1e1e' : '#f8f8f8'};
  color: ${({ theme }) => theme.text.primary};
`;

const ErrorBanner = styled.div`
  padding: 8px 10px;
  border: 1px solid rgba(239,68,68,0.4);
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)'};
  color: #ef4444;
  border-radius: 6px;
  font-size: 12px;
`;

export default function SchemaEditor({ isOpen, onClose }) {
  const { schema, setSchema, resetSchema, importSchema, exportSchema } = useSchemaStore();
  const [activeTab, setActiveTab] = useState('visual');
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(schema, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [filter, setFilter] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const working = useMemo(() => JSON.parse(JSON.stringify(schema)), [schema]);
  const [workingSchema, setWorkingSchema] = useState(working);

  // Sync working draft when schema changes externally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncFromStore = () => {
    setWorkingSchema(JSON.parse(JSON.stringify(schema)));
    setJsonDraft(JSON.stringify(schema, null, 2));
    setJsonError(null);
  };

  if (!isOpen) return null;

  const addDatabase = () => {
    const name = prompt('Database name');
    if (!name) return;
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases.push({ name, tables: [] });
    setWorkingSchema(next);
  };

  const removeDatabase = (idx) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases.splice(idx, 1);
    setWorkingSchema(next);
  };

  const renameDatabase = (idx, name) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[idx].name = name;
    setWorkingSchema(next);
  };

  const addTable = (dbIdx) => {
    const name = prompt('Table name');
    if (!name) return;
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables.push({ name, columns: [] });
    setWorkingSchema(next);
  };

  const removeTable = (dbIdx, tIdx) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables.splice(tIdx, 1);
    setWorkingSchema(next);
  };

  const renameTable = (dbIdx, tIdx, name) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables[tIdx].name = name;
    setWorkingSchema(next);
  };

  const addColumn = (dbIdx, tIdx) => {
    const name = prompt('Column name');
    if (!name) return;
    const type = prompt('Column type (e.g., VARCHAR(100), INTEGER)') || 'TEXT';
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables[tIdx].columns.push({ name, type });
    setWorkingSchema(next);
  };

  const removeColumn = (dbIdx, tIdx, cIdx) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables[tIdx].columns.splice(cIdx, 1);
    setWorkingSchema(next);
  };

  const updateColumn = (dbIdx, tIdx, cIdx, key, value) => {
    const next = JSON.parse(JSON.stringify(workingSchema));
    next.databases[dbIdx].tables[tIdx].columns[cIdx][key] = value;
    setWorkingSchema(next);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        const { valid, message } = validateSchema(parsed);
        if (!valid) {
          alert(`Invalid schema: ${message}`);
          return;
        }
        setWorkingSchema(parsed);
        setJsonDraft(JSON.stringify(parsed, null, 2));
        setJsonError(null);
      } catch (e) {
        alert(`Failed to import: ${e.message}`);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(workingSchema, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleSave = () => {
    try {
      setSchema(workingSchema);
      onClose?.();
    } catch (e) {
      alert(e.message || 'Invalid schema');
    }
  };

  const handleReset = () => {
    if (confirm('Reset schema to starter example?')) {
      resetSchema();
      syncFromStore();
    }
  };

  const onJsonChange = (text) => {
    setJsonDraft(text);
    try {
      const parsed = JSON.parse(text);
      const { valid, message } = validateSchema(parsed);
      setJsonError(valid ? null : message || 'Invalid schema');
      if (valid) setWorkingSchema(parsed);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const matchesFilter = (dbName, tableName, colName) => {
    const f = filter.trim().toLowerCase();
    if (!f) return true;
    return (
      (dbName && dbName.toLowerCase().includes(f)) ||
      (tableName && tableName.toLowerCase().includes(f)) ||
      (colName && colName.toLowerCase().includes(f))
    );
  };

  const toggleGroup = (key, value = undefined) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: value === undefined ? !prev[key] : value,
    }));
  };

  const expandAll = () => {
    const next = {};
    workingSchema.databases.forEach((db) => {
      db.tables.forEach((t) => {
        next[`${db.name}.${t.name}`] = true;
      });
    });
    setExpandedGroups(next);
  };

  const collapseAll = () => setExpandedGroups({});

  return (
    <Backdrop>
      <Modal>
        <Header>
          <Title>Schema Editor</Title>
          <Row>
            <Button onClick={handleImport}>Import</Button>
            <Button onClick={handleExport}>Export</Button>
            <Danger onClick={handleReset}>Reset</Danger>
            <Button onClick={onClose}>Close</Button>
          </Row>
        </Header>
        <Body>
          <Left>
            <Tabs>
              <Tab $active={activeTab === 'visual'} onClick={() => setActiveTab('visual')}>Visual Editor</Tab>
              <Tab $active={activeTab === 'json'} onClick={() => setActiveTab('json')}>JSON Editor</Tab>
            </Tabs>

            {activeTab === 'visual' && (
              <Section style={{ maxHeight: 180 }}>
                <SectionHeader>
                  <span>Databases</span>
                  <Button onClick={addDatabase}>Add Database</Button>
                </SectionHeader>
                <SectionBody>
                  <List>
                    {workingSchema.databases.map((db, dbIdx) => (
                      <Item key={dbIdx}>
                        <Input
                          value={db.name}
                          onChange={(e) => renameDatabase(dbIdx, e.target.value)}
                          placeholder="database name"
                        />
                        <Button onClick={() => addTable(dbIdx)}>+ Table</Button>
                        <Danger onClick={() => removeDatabase(dbIdx)}>Remove</Danger>
                      </Item>
                    ))}
                  </List>
                </SectionBody>
              </Section>
            )}

            {activeTab === 'visual' && (
              <Section style={{ flex: 1, minHeight: 240 }}>
                <SectionHeader>
                  <span>Tables & Columns</span>
                </SectionHeader>
                <SectionBody>
                  <List>
                    {workingSchema.databases.map((db, dbIdx) => (
                      <div key={dbIdx} style={{ width: '100%' }}>
                        <Small>{db.name}</Small>
                        {db.tables.map((t, tIdx) => (
                          <Item key={`${dbIdx}-${tIdx}`}>
                            <Input
                              value={t.name}
                              onChange={(e) => renameTable(dbIdx, tIdx, e.target.value)}
                              placeholder="table name"
                            />
                            <Button onClick={() => addColumn(dbIdx, tIdx)}>+ Column</Button>
                            <Danger onClick={() => removeTable(dbIdx, tIdx)}>Remove</Danger>
                          </Item>
                        ))}
                      </div>
                    ))}
                  </List>
                </SectionBody>
              </Section>
            )}
          </Left>

          <Right>
            {activeTab === 'visual' && (
              <Section style={{ flex: 1, minHeight: 300 }}>
                <SectionHeader>
                  <span>Quick Edit Columns</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Filter db / table / column"
                      style={{ maxWidth: 220 }}
                    />
                    <Button onClick={expandAll}>Expand All</Button>
                    <Button onClick={collapseAll}>Collapse All</Button>
                  </div>
                </SectionHeader>
                <SectionBody>
                  <List>
                    {workingSchema.databases.map((db, dbIdx) => (
                      <div key={dbIdx} style={{ width: '100%' }}>
                        {db.tables
                          .filter((t) => matchesFilter(db.name, t.name))
                          .map((t, tIdx) => {
                            const key = `${db.name}.${t.name}`;
                            const expanded = expandedGroups[key] ?? false;
                            const anyColumnMatches = t.columns.some((c) => matchesFilter(db.name, t.name, c.name));
                            if (!anyColumnMatches && !matchesFilter(db.name, t.name)) return null;
                            return (
                              <div key={`${dbIdx}-${tIdx}-cols`} style={{ paddingBottom: 6 }}>
                                <Item>
                                  <button
                                    onClick={() => toggleGroup(key)}
                                    style={{ background: 'none', border: '1px solid var(--theme-border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'inherit' }}
                                    title={expanded ? 'Collapse' : 'Expand'}
                                  >
                                    {expanded ? '-' : '+'}
                                  </button>
                                  <Small style={{ marginLeft: 6 }}>{db.name}.{t.name}</Small>
                                </Item>
                                {expanded && t.columns
                                  .filter((c) => matchesFilter(db.name, t.name, c.name))
                                  .map((c, cIdx) => (
                                  <Item key={`${dbIdx}-${tIdx}-${cIdx}`}>
                                    <Input
                                      value={c.name}
                                      onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'name', e.target.value)}
                                      placeholder="column name"
                                    />
                                    <Input
                                      value={c.type}
                                      onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'type', e.target.value)}
                                      placeholder="type"
                                      style={{ maxWidth: 180 }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input
                                        type="checkbox"
                                        checked={!!c.isPrimary}
                                        onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'isPrimary', e.target.checked)}
                                      />
                                      <Small>PK</Small>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input
                                        type="checkbox"
                                        checked={!!c.isForeignKey}
                                        onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'isForeignKey', e.target.checked)}
                                      />
                                      <Small>FK</Small>
                                    </label>
                                    <Input
                                      value={c.references || ''}
                                      onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'references', e.target.value)}
                                      placeholder="references e.g. users(id)"
                                      style={{ maxWidth: 220 }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input
                                        type="checkbox"
                                        checked={c.isNullable !== false}
                                        onChange={(e) => updateColumn(dbIdx, tIdx, cIdx, 'isNullable', e.target.checked ? true : false)}
                                      />
                                      <Small>Nullable</Small>
                                    </label>
                                    <Danger onClick={() => removeColumn(dbIdx, tIdx, cIdx)}>Remove</Danger>
                                  </Item>
                                ))}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </List>
                </SectionBody>
              </Section>
            )}

            {activeTab === 'json' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
                {jsonError && <ErrorBanner>{jsonError}</ErrorBanner>}
                <TextArea value={jsonDraft} onChange={(e) => onJsonChange(e.target.value)} />
              </div>
            )}
          </Right>
        </Body>
        <Footer>
          <Small>Changes are saved to your browser storage</Small>
          <Row>
            <Button onClick={syncFromStore}>Revert</Button>
            <Button onClick={handleSave}>Save</Button>
          </Row>
        </Footer>
      </Modal>
    </Backdrop>
  );
}