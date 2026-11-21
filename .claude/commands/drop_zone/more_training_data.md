# More Training Data Command

## Purpose
Generate synthetic training data by analyzing patterns in existing datasets and creating additional similar examples.

## Variables
- `[[FILE_PATH]]` - The absolute path to the training data file (CSV or JSONL)

## Task
Analyze the file at `[[FILE_PATH]]` and generate additional synthetic training examples.

### Processing Steps:

1. **Load and Analyze Sample**
   - Read first 100 rows to understand data structure
   - Identify column types (numeric, categorical, text, datetime)
   - Detect patterns, distributions, and relationships
   - Note any classification labels or target variables

2. **Generate Synthetic Data**
   - Create 25 new rows (configurable) that match the patterns
   - Maintain statistical distributions of original data
   - Preserve relationships between columns
   - Ensure diversity while staying realistic
   - For text fields, generate contextually appropriate content
   - For classification data, maintain class balance

3. **Efficient Appending**
   - Use bash commands to append without loading entire file into memory
   - For CSV: append rows with proper escaping
   - For JSONL: append one JSON object per line
   - Preserve original file with backup: `original_filename.backup`

4. **Quality Validation**
   - Verify generated data matches schema
   - Check for duplicates with original data
   - Validate data types and ranges
   - Ensure no corrupted entries

### File Format Handling:

#### CSV Files:
```bash
# Append generated rows efficiently
echo "generated,data,row1" >> [[FILE_PATH]]
echo "generated,data,row2" >> [[FILE_PATH]]
```

#### JSONL Files:
```bash
# Append JSON objects line by line
echo '{"field1": "value", "field2": 123}' >> [[FILE_PATH]]
```

### Output:
1. Enhanced training file with synthetic data appended
2. Generation report saved to: `training_data_zone/reports/<timestamp>_report.txt`
3. Statistics showing:
   - Original row count
   - Generated row count
   - Final row count
   - Sample of generated data

### Configuration Options:
```yaml
generation_config:
  num_rows: 25              # Number of rows to generate
  preserve_distribution: true
  add_variation: 0.1        # 10% variation in numeric fields
  text_creativity: 0.7      # Creativity level for text generation
```

### Examples:

#### Twitter Classification Dataset:
- Analyze sentiment labels distribution
- Generate tweets with similar length and vocabulary
- Maintain hashtag and mention patterns
- Preserve sentiment class balance

#### Bank Statement CSV:
- Maintain transaction amount distributions
- Generate realistic merchant names
- Preserve date patterns and sequences
- Keep category distributions consistent

### Error Handling:
- Backup original file before modifications
- Validate file format before processing
- Handle encoding issues (UTF-8, Latin-1, etc.)
- Report any data corruption or format issues
- Rollback on critical errors