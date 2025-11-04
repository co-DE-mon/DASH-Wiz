import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'dashwiz.csv.datasets.v1';

function parseCSV(text) {
  const rows = [];
  const cols = [];
  let current = '';
  let inQuotes = false;
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { // escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(current);
        current = '';
      } else if (c === '\n') {
        row.push(current);
        rows.push(row);
        row = [];
        current = '';
      } else if (c === '\r') {
        // ignore CR, handle with LF
      } else {
        current += c;
      }
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  if (rows.length === 0) return { columns: [], rows: [] };
  const header = rows[0];
  for (const h of header) cols.push(h || 'column');
  const dataRows = rows.slice(1).map(r => {
    const obj = {};
    for (let i = 0; i < cols.length; i++) {
      obj[cols[i]] = r[i] ?? '';
    }
    return obj;
  });
  return { columns: cols, rows: dataRows };
}

const CSVContext = createContext(null);

export function CSVProvider({ children }) {
  const [datasets, setDatasets] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const importCSV = useCallback(async (file) => {
    const text = await file.text();
    const { columns, rows } = parseCSV(text);
    const name = file.name.replace(/\.[^.]+$/, '');
    const dataset = { id: Date.now(), name, columns, rows };
    setDatasets(prev => {
      const next = [dataset, ...prev];
      persist(next);
      return next;
    });
    return dataset;
  }, [persist]);

  const clearDatasets = useCallback(() => {
    setDatasets([]);
    persist([]);
  }, [persist]);

  const value = useMemo(() => ({ datasets, importCSV, clearDatasets }), [datasets, importCSV, clearDatasets]);

  return (
    <CSVContext.Provider value={value}>
      {children}
    </CSVContext.Provider>
  );
}

export default function useCSVStore() {
  const ctx = useContext(CSVContext);
  if (!ctx) throw new Error('useCSVStore must be used within a CSVProvider');
  return ctx;
}


