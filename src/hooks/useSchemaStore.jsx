import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mockDatabaseSchema } from '../data/schemaData';

const STORAGE_KEY = 'dashwiz.schema.v1';

function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

export function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') return { valid: false, message: 'Schema must be an object' };
  if (!Array.isArray(schema.databases)) return { valid: false, message: 'Schema must have databases[]' };

  const dbNames = new Set();
  for (const db of schema.databases) {
    if (!db || typeof db !== 'object') return { valid: false, message: 'Invalid database entry' };
    if (!db.name || typeof db.name !== 'string') return { valid: false, message: 'Database name is required' };
    if (dbNames.has(db.name)) return { valid: false, message: `Duplicate database name: ${db.name}` };
    dbNames.add(db.name);

    if (!Array.isArray(db.tables)) return { valid: false, message: `Database ${db.name} must have tables[]` };
    const tableNames = new Set();
    for (const table of db.tables) {
      if (!table || typeof table !== 'object') return { valid: false, message: 'Invalid table entry' };
      if (!table.name || typeof table.name !== 'string') return { valid: false, message: 'Table name is required' };
      if (tableNames.has(table.name)) return { valid: false, message: `Duplicate table name in ${db.name}: ${table.name}` };
      tableNames.add(table.name);

      if (!Array.isArray(table.columns)) return { valid: false, message: `Table ${db.name}.${table.name} must have columns[]` };
      const columnNames = new Set();
      for (const col of table.columns) {
        if (!col || typeof col !== 'object') return { valid: false, message: 'Invalid column entry' };
        if (!col.name || typeof col.name !== 'string') return { valid: false, message: `Column name required in ${db.name}.${table.name}` };
        if (columnNames.has(col.name)) return { valid: false, message: `Duplicate column name in ${db.name}.${table.name}: ${col.name}` };
        columnNames.add(col.name);
        if (!col.type || typeof col.type !== 'string') return { valid: false, message: `Column type required for ${db.name}.${table.name}.${col.name}` };
        if (col.isForeignKey && !col.references) return { valid: false, message: `Foreign key requires references for ${db.name}.${table.name}.${col.name}` };
      }
    }
  }

  return { valid: true };
}

export default function useSchemaStore() {
  const [schema, setSchemaState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const { valid } = validateSchema(parsed);
        if (valid) return parsed;
      }
    } catch {}
    return deepClone(mockDatabaseSchema);
  });

  const lastGoodRef = useRef(schema);

  const saveToStorage = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setSchema = useCallback((next) => {
    const { valid, message } = validateSchema(next);
    if (!valid) throw new Error(message || 'Invalid schema');
    setSchemaState(next);
    lastGoodRef.current = next;
    saveToStorage(next);
  }, [saveToStorage]);

  const resetSchema = useCallback(() => {
    const base = deepClone(mockDatabaseSchema);
    setSchema(base);
  }, [setSchema]);

  const importSchema = useCallback((jsonString) => {
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    setSchema(parsed);
  }, [setSchema]);

  const exportSchema = useCallback(() => {
    return JSON.stringify(schema, null, 2);
  }, [schema]);

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const { valid } = validateSchema(parsed);
      if (valid) {
        setSchemaState(parsed);
        lastGoodRef.current = parsed;
      }
    } catch {}
  }, []);

  const isValid = useMemo(() => validateSchema(schema).valid, [schema]);

  useEffect(() => {
    const { valid } = validateSchema(schema);
    if (valid) lastGoodRef.current = schema;
  }, [schema]);

  return {
    schema,
    setSchema,
    resetSchema,
    importSchema,
    exportSchema,
    loadFromStorage,
    isValid,
    lastGood: lastGoodRef.current,
  };
}