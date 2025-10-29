/**
 * Database Schema Data
 * 
 * Centralized schema data for use by DatabaseExplorer and Natural Query features
 */

export const mockDatabaseSchema = {
  databases: [
    {
      name: "sales_db",
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "username", type: "VARCHAR(50)", isNullable: false },
            { name: "email", type: "VARCHAR(100)", isNullable: false },
            { name: "first_name", type: "VARCHAR(50)", isNullable: true },
            { name: "last_name", type: "VARCHAR(50)", isNullable: true },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
            { name: "last_login", type: "TIMESTAMP", isNullable: true },
          ],
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR(100)", isNullable: false },
            { name: "category", type: "VARCHAR(50)", isNullable: false },
            { name: "price", type: "DECIMAL(10,2)", isNullable: false },
            { name: "stock", type: "INTEGER", isNullable: false },
            { name: "description", type: "TEXT", isNullable: true },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
          ],
        },
        {
          name: "orders",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "user_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "users(id)",
            },
            { name: "total_amount", type: "DECIMAL(10,2)", isNullable: false },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
            { name: "updated_at", type: "TIMESTAMP", isNullable: true },
          ],
        },
        {
          name: "order_items",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "order_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "orders(id)",
            },
            {
              name: "product_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "products(id)",
            },
            { name: "quantity", type: "INTEGER", isNullable: false },
            { name: "price", type: "DECIMAL(10,2)", isNullable: false },
          ],
        },
        {
          name: "monthly_sales",
          columns: [
            { name: "month", type: "VARCHAR(20)", isPrimary: true },
            { name: "year", type: "INTEGER", isPrimary: true },
            { name: "total_sales", type: "DECIMAL(15,2)", isNullable: false },
            { name: "total_orders", type: "INTEGER", isNullable: false },
            {
              name: "avg_order_value",
              type: "DECIMAL(10,2)",
              isNullable: false,
            },
          ],
        },
      ],
    },
    {
      name: "marketing_db",
      tables: [
        {
          name: "campaigns",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR(100)", isNullable: false },
            { name: "start_date", type: "DATE", isNullable: false },
            { name: "end_date", type: "DATE", isNullable: true },
            { name: "budget", type: "DECIMAL(12,2)", isNullable: false },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
          ],
        },
        {
          name: "leads",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "campaign_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "campaigns(id)",
            },
            { name: "email", type: "VARCHAR(100)", isNullable: false },
            { name: "phone", type: "VARCHAR(20)", isNullable: true },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
          ],
        },
      ],
    },
  ],
};

export default mockDatabaseSchema;

