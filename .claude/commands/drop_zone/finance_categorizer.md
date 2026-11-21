# Finance Categorizer Command

## Purpose
Automatically categorize financial transactions from bank statements and credit card exports into meaningful categories for budgeting and analysis.

## Variables
- `[[FILE_PATH]]` - The absolute path to the CSV file containing financial transactions

## Task
Process the financial data file at `[[FILE_PATH]]` to categorize and analyze transactions.

### Input File Analysis:

1. **Detect CSV Structure**
   - Identify column headers (Date, Description, Amount, Balance, etc.)
   - Detect date format (MM/DD/YYYY, YYYY-MM-DD, etc.)
   - Determine debit/credit format (single column with +/- or separate columns)
   - Handle different bank export formats (Chase, Wells Fargo, Bank of America, etc.)

2. **Common Column Patterns**:
   ```
   Common formats:
   - Date, Description, Amount, Balance
   - Transaction Date, Post Date, Description, Category, Type, Amount, Memo
   - Date, Payee, Category, Memo, Outflow, Inflow
   ```

### Categorization Engine:

1. **Smart Category Assignment**
   Categories based on merchant analysis and transaction patterns:
   
   ```yaml
   categories:
     Food & Dining:
       - Restaurants
       - Fast Food
       - Coffee Shops
       - Groceries
       - Food Delivery
     
     Transportation:
       - Gas/Fuel
       - Public Transit
       - Rideshare (Uber/Lyft)
       - Parking/Tolls
       - Auto Maintenance
     
     Shopping:
       - Clothing
       - Electronics
       - Home Goods
       - Online Marketplaces
       - Department Stores
     
     Bills & Utilities:
       - Electricity/Gas
       - Water
       - Internet/Cable
       - Phone
       - Insurance
     
     Housing:
       - Rent/Mortgage
       - Home Maintenance
       - Property Tax
       - HOA Fees
     
     Entertainment:
       - Streaming Services
       - Movies/Concerts
       - Gaming
       - Sports/Recreation
       - Books/Media
     
     Healthcare:
       - Doctor/Dentist
       - Pharmacy
       - Health Insurance
       - Fitness/Gym
     
     Financial:
       - Bank Fees
       - Interest Charges
       - Investments
       - Transfers
       - ATM Withdrawals
     
     Income:
       - Salary/Wages
       - Freelance/Contract
       - Refunds
       - Interest Earned
       - Other Income
     
     Travel:
       - Hotels
       - Flights
       - Vacation
       - Travel Insurance
     
     Education:
       - Tuition
       - Books/Supplies
       - Courses/Training
     
     Personal:
       - Personal Care
       - Gifts
       - Donations
       - Subscriptions
       - Miscellaneous
   ```

2. **Merchant Recognition**
   - Build merchant database from descriptions
   - Use pattern matching for common merchants:
     - `STARBUCKS` → Coffee Shops
     - `SHELL OIL` → Gas/Fuel
     - `AMAZON.COM` → Online Marketplaces
     - `NETFLIX` → Streaming Services
   - Handle variations (AMZN, AMAZN, AMAZON MARKETPLACE)

3. **Machine Learning Enhancement**
   - Learn from patterns in descriptions
   - Identify recurring transactions
   - Suggest categories for ambiguous items
   - Improve accuracy over time

### Processing Steps:

1. **Data Cleaning**
   ```python
   - Remove duplicates
   - Fix date inconsistencies
   - Normalize amounts (handle different formats)
   - Clean merchant names (remove transaction IDs, dates from descriptions)
   ```

2. **Categorization**
   ```python
   for transaction in transactions:
       category = categorize_transaction(transaction.description)
       subcategory = get_subcategory(category, transaction)
       confidence = calculate_confidence(transaction, category)
   ```

3. **Analysis & Reporting**
   Generate comprehensive analysis:
   
   ```markdown
   # Financial Analysis Report - [Month/Year]
   
   ## Summary Statistics
   - Total Income: $X,XXX.XX
   - Total Expenses: $X,XXX.XX
   - Net Cash Flow: $X,XXX.XX
   - Average Daily Spend: $XX.XX
   
   ## Category Breakdown
   | Category | Amount | % of Total | # Transactions |
   |----------|--------|------------|----------------|
   | Food & Dining | $XXX.XX | 25% | 42 |
   | Transportation | $XXX.XX | 15% | 18 |
   ...
   
   ## Top Merchants
   1. Merchant A - $XXX.XX (12 transactions)
   2. Merchant B - $XXX.XX (8 transactions)
   
   ## Insights
   - Highest spending category: [Category]
   - Unusual transactions detected: [List]
   - Recurring subscriptions identified: [List with amounts]
   - Potential savings opportunities: [Suggestions]
   ```

4. **Output Files**
   Save to: `finance_zone/output/<timestamp>/`
   - `categorized_transactions.csv` - Original data with added category columns
   - `analysis_report.md` - Detailed analysis and insights
   - `monthly_summary.json` - Structured data for further processing
   - `visualization.html` - Interactive charts and graphs
   - `recurring_transactions.csv` - Identified subscriptions and recurring charges

### Advanced Features:

1. **Budget Tracking**
   ```yaml
   budget_limits:
     Food & Dining: 500
     Entertainment: 200
     Shopping: 300
   ```
   - Compare actual spending vs budget
   - Alert on categories exceeding budget
   - Project month-end totals

2. **Trend Analysis**
   - Month-over-month comparisons
   - Identify spending patterns
   - Seasonal variation detection
   - Unusual transaction alerts

3. **Tax Preparation Helper**
   - Flag tax-deductible transactions
   - Separate business expenses
   - Track charitable donations
   - Export tax-relevant categories

4. **Savings Recommendations**
   - Identify unused subscriptions
   - Suggest category reductions
   - Find cheaper alternatives
   - Calculate potential monthly savings

### Validation & Quality Control:

1. **Accuracy Checks**
   - Verify total amounts match
   - Check for uncategorized transactions
   - Flag low-confidence categorizations for review
   - Validate date ranges

2. **Manual Override Support**
   ```csv
   # Override file format
   Transaction_ID,Manual_Category,Notes
   12345,Healthcare,Doctor visit
   67890,Business,Client dinner
   ```

3. **Learning from Corrections**
   - Track manual overrides
   - Update categorization rules
   - Improve pattern matching

### Error Handling:
- Handle various CSV encodings (UTF-8, Latin-1, Windows-1252)
- Manage missing or malformed data
- Process international currency symbols
- Deal with merged cells or irregular formats
- Provide clear error messages for unsupported formats