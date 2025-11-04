# 🚀 DASH-Wiz Natural-SQL Quick Start Guide

Welcome to DASH-Wiz's Natural Query feature! This guide will get you up and running in 5 minutes.

## Prerequisites

✅ Phase 1 Complete (Environment & Configuration)
✅ Backend service installed
✅ Frontend dependencies installed

## Quick Setup

### 1. Start the Backend (Terminal 1)

```bash
cd path/to/DASH-Wiz
python model_service.py
```

**Expected Output:**
```
🚀 DASH-Wiz Backend Service Starting...
✅ Tokenizer loaded successfully
✅ Model loaded successfully
🎉 DASH-Wiz Backend is READY to accept requests!
📡 API Documentation: http://localhost:8000/docs
```

### 2. Start the Frontend (Terminal 2)

```bash
cd path/to/DASH-Wiz
npm run dev
```

**Expected Output:**
```
VITE v6.2.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 3. Access DASH-Wiz

Open your browser to: **http://localhost:5173**

## Using Natural Query Mode

### Method 1: Keyboard Shortcut (Fastest!)

Press **`Ctrl+K`** (Windows/Linux) or **`Cmd+K`** (Mac)

### Method 2: Click Toggle Button

Click the **"Natural Query"** button in the editor toolbar

## Your First Natural Query

1. **Switch to Natural Query mode** (Ctrl+K)

2. **Check the status indicator** in the top right:
   - 🟢 Green = "AI Ready" ✅
   - 🔴 Red = "AI Offline" ❌ (check backend)

3. **Type a question** in the input field:
   ```
   Show me all users who registered in the last month
   ```

4. **Press Enter** or click "Generate SQL"

5. **Review the generated SQL**:
   ```sql
   SELECT * FROM users 
   WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH);
   ```

6. **Click "Use This Query in Editor"** to execute it!

## Example Questions to Try

```
1. What are the top 5 best selling products?
2. Calculate total revenue by product category
3. Find customers who have never placed an order
4. Show me orders from the last 7 days
5. Which products are out of stock?
```

## Features Overview

### 🎯 Natural Query Panel

- **Question Input**: Type your question in plain English
- **Schema Preview**: See your database structure
- **AI Status**: Real-time backend connection status
- **SQL Output**: View generated SQL with syntax highlighting
- **Quick Actions**: Copy or use the query immediately

### 📚 Natural Query History

Access via **Sidebar → Natural Query Tab** (lightning icon ⚡)

- View all your past natural queries
- See questions, generated SQL, and execution results
- Run queries again with one click
- Track success rate and statistics
- Clear history anytime

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Toggle Natural Query mode |
| `Enter` | Generate SQL (in question input) |

### 🔄 Mode Toggle

Switch seamlessly between:
- **SQL Mode**: Traditional SQL editor with Monaco
- **Natural Mode**: AI-powered question interface

## Workflow Example

**Scenario**: You want to analyze customer purchases

1. **Press `Ctrl+K`** to enter Natural Query mode

2. **Ask**: "Show me customers who spent more than $1000"

3. **Review the SQL**:
   ```sql
   SELECT c.name, c.email, SUM(o.total_amount) as total_spent
   FROM customers c
   JOIN orders o ON c.id = o.customer_id
   GROUP BY c.id, c.name, c.email
   HAVING SUM(o.total_amount) > 1000
   ORDER BY total_spent DESC;
   ```

4. **Click "Use This Query"** → Query executes automatically

5. **View results** in the results panel

6. **Check history** in sidebar → Natural Query tab

## Troubleshooting

### ❌ "AI Offline" Status

**Solution:**
1. Check if backend is running
2. Run: `python model_service.py`
3. Wait for "READY to accept requests!" message
4. Refresh DASH-Wiz frontend

### ❌ No SQL Generated

**Solution:**
1. Check your question is clear and specific
2. Ensure schema is available (check preview)
3. Look for error messages in red box
4. Check browser console for details

### ❌ "Request Timeout"

**Solution:**
1. First query may take 30-60 seconds (model loading)
2. Subsequent queries are much faster
3. Check backend terminal for progress
4. Increase timeout in `.env` if needed:
   ```
   VITE_API_TIMEOUT=60000
   ```

### ❌ Keyboard Shortcut Not Working

**Solution:**
1. Close any browser extensions that might intercept Ctrl+K
2. Try clicking the toggle button instead
3. Reload the page

## Tips for Better Results

### ✅ Good Questions:

```
✓ "Show me all users who registered last month"
✓ "What are the top 10 products by revenue?"
✓ "Find orders with status 'pending' from this week"
✓ "Calculate average order value by customer"
```

### ❌ Avoid:

```
✗ "Show me everything" (too vague)
✗ "Data" (not specific)
✗ Questions about tables not in your schema
```

### 💡 Pro Tips:

1. **Be specific**: Mention exact column names or table names if known
2. **Use time frames**: "last month", "this year", "last 7 days"
3. **Specify aggregations**: "total", "average", "count", "top 5"
4. **Include filters**: "active users", "completed orders", "high-value customers"

## Architecture Quick Reference

```
┌─────────────────────┐
│   DASH-Wiz UI       │
│   (Port 5173)       │
│                     │
│ [SQL Mode | Natural]│ ← Ctrl+K Toggle
│                     │
│  Natural Mode:      │
│  ┌───────────────┐  │
│  │ Question:     │  │
│  │ "Show all..."│  │
│  └───────────────┘  │
│         ↓           │
│  Schema: AUTO       │
│         ↓           │
└─────────────────────┘
          │
          │ POST /generate-sql
          ↓
┌─────────────────────┐
│  Backend Service    │
│  (Port 8000)        │
│                     │
│  Natural-SQL Model  │
│  (7B, 4-bit quant) │
│                     │
│  Response: SQL ✓    │
└─────────────────────┘
```

## Next Steps

🎓 **Learn More:**
- Read `docs/PHASE1_SETUP.md` for environment details
- Read `docs/PHASE2_INTEGRATION.md` for technical details
- Visit http://localhost:8000/docs for API documentation

🚀 **Advanced Usage:**
- Provide your schema via the Schema Editor in the app or supply it from your backend API (schema shape: `{ databases: [...] }`).
- Adjust API timeout in `.env`
- Enable debug logging for troubleshooting

🤝 **Need Help?**
- Check the troubleshooting section above
- Review the console for error messages
- Ensure backend and frontend are both running

---

**Happy Querying! 🎉**

Generated with ❤️ by DASH-Wiz Natural-SQL Integration

