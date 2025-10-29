/**
 * Schema Extractor Utility
 * 
 * Converts database schema information from DatabaseExplorer
 * into SQL DDL (Data Definition Language) format for the Natural-SQL model.
 */

/**
 * Convert a single column definition to SQL DDL format
 * @param {Object} column - Column object from DatabaseExplorer
 * @returns {string} SQL column definition
 */
const columnToSQL = (column) => {
  let definition = `  ${column.name} ${column.type}`;
  
  if (column.isPrimary) {
    definition += ' PRIMARY KEY';
  }
  
  if (column.isNullable === false && !column.isPrimary) {
    definition += ' NOT NULL';
  }
  
  if (column.isForeignKey && column.references) {
    definition += ` REFERENCES ${column.references}`;
  }
  
  return definition;
};

/**
 * Convert a single table to CREATE TABLE statement
 * @param {Object} table - Table object from DatabaseExplorer
 * @param {string} databaseName - Name of the database
 * @returns {string} CREATE TABLE SQL statement
 */
export const tableToSQL = (table, databaseName = null) => {
  const prefix = databaseName ? `${databaseName}.` : '';
  let sql = `CREATE TABLE ${prefix}${table.name} (\n`;
  
  const columnDefinitions = table.columns.map(col => columnToSQL(col));
  sql += columnDefinitions.join(',\n');
  
  sql += '\n);';
  return sql;
};

/**
 * Convert entire database schema to SQL DDL
 * @param {Object} schemaData - Schema data from DatabaseExplorer (mockDatabaseSchema format)
 * @returns {string} Complete SQL DDL script
 */
export const schemaToSQL = (schemaData) => {
  if (!schemaData || !schemaData.databases) {
    return '';
  }
  
  const sqlStatements = [];
  
  schemaData.databases.forEach(database => {
    // Add comment for database
    sqlStatements.push(`-- Database: ${database.name}`);
    sqlStatements.push('');
    
    // Convert each table
    database.tables.forEach(table => {
      sqlStatements.push(tableToSQL(table, database.name));
      sqlStatements.push('');
    });
  });
  
  return sqlStatements.join('\n');
};

/**
 * Extract schema for a specific table
 * @param {Object} schemaData - Schema data from DatabaseExplorer
 * @param {string} tableName - Name of the table to extract
 * @returns {string} SQL DDL for the specific table and related tables
 */
export const extractTableSchema = (schemaData, tableName) => {
  if (!schemaData || !schemaData.databases) {
    return '';
  }
  
  const relatedTables = new Set();
  let targetTable = null;
  let targetDatabase = null;
  
  // Find the target table and identify related tables through foreign keys
  for (const database of schemaData.databases) {
    for (const table of database.tables) {
      if (table.name === tableName) {
        targetTable = table;
        targetDatabase = database.name;
        relatedTables.add(table.name);
        
        // Find related tables through foreign keys
        table.columns.forEach(column => {
          if (column.isForeignKey && column.references) {
            const refTable = column.references.split('(')[0];
            relatedTables.add(refTable);
          }
        });
      }
    }
  }
  
  if (!targetTable) {
    return '';
  }
  
  const sqlStatements = [];
  sqlStatements.push(`-- Table: ${tableName} and related tables`);
  sqlStatements.push('');
  
  // Generate SQL for target table and related tables
  for (const database of schemaData.databases) {
    for (const table of database.tables) {
      if (relatedTables.has(table.name)) {
        sqlStatements.push(tableToSQL(table, targetDatabase));
        sqlStatements.push('');
      }
    }
  }
  
  return sqlStatements.join('\n');
};

/**
 * Create a compact schema representation (just table and column names)
 * Useful for smaller contexts or quick reference
 * @param {Object} schemaData - Schema data from DatabaseExplorer
 * @returns {string} Compact schema representation
 */
export const compactSchemaToSQL = (schemaData) => {
  if (!schemaData || !schemaData.databases) {
    return '';
  }
  
  const sqlStatements = [];
  
  schemaData.databases.forEach(database => {
    sqlStatements.push(`-- Database: ${database.name}`);
    
    database.tables.forEach(table => {
      const columns = table.columns.map(col => {
        let def = col.name;
        if (col.isPrimary) def += ' [PK]';
        if (col.isForeignKey) def += ' [FK]';
        return def;
      }).join(', ');
      
      sqlStatements.push(`-- ${database.name}.${table.name}: ${columns}`);
    });
    
    sqlStatements.push('');
  });
  
  return sqlStatements.join('\n');
};

/**
 * Get a list of all table names from the schema
 * @param {Object} schemaData - Schema data from DatabaseExplorer
 * @returns {Array<{database: string, table: string}>} List of table names with their databases
 */
export const getAllTableNames = (schemaData) => {
  if (!schemaData || !schemaData.databases) {
    return [];
  }
  
  const tables = [];
  
  schemaData.databases.forEach(database => {
    database.tables.forEach(table => {
      tables.push({
        database: database.name,
        table: table.name,
        fullName: `${database.name}.${table.name}`
      });
    });
  });
  
  return tables;
};

/**
 * Generate schema with sample data comments
 * Helps AI understand data patterns
 * @param {Object} schemaData - Schema data from DatabaseExplorer
 * @returns {string} SQL DDL with comments about expected data
 */
export const schemaWithDataHints = (schemaData) => {
  if (!schemaData || !schemaData.databases) {
    return '';
  }
  
  const sqlStatements = [];
  
  schemaData.databases.forEach(database => {
    sqlStatements.push(`-- Database: ${database.name}`);
    sqlStatements.push('');
    
    database.tables.forEach(table => {
      const tableSQL = tableToSQL(table, database.name);
      sqlStatements.push(tableSQL);
      
      // Add hint about what data might look like
      if (table.name.toLowerCase().includes('user')) {
        sqlStatements.push('-- Contains user account information');
      } else if (table.name.toLowerCase().includes('order')) {
        sqlStatements.push('-- Contains order/transaction records');
      } else if (table.name.toLowerCase().includes('product')) {
        sqlStatements.push('-- Contains product catalog information');
      }
      
      sqlStatements.push('');
    });
  });
  
  return sqlStatements.join('\n');
};

export default {
  tableToSQL,
  schemaToSQL,
  extractTableSchema,
  compactSchemaToSQL,
  getAllTableNames,
  schemaWithDataHints
};

