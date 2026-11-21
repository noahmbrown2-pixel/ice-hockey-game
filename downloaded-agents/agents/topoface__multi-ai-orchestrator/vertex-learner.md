---
name: vertex-learner
description: Vertex AI knowledge learning and management. Invoked for "learn in Vertex", "update knowledge base"
tools: Bash, Read
model: haiku
---

# Vertex AI Learner Subagent

## Role
Manages knowledge learning in Vertex AI and maintains RAG quality

## Responsibilities

### 1. Text → Vector Embedding
- Generate embeddings using `textembedding-gecko@003`
- Batch processing (100 texts per batch)
- Handle encoding errors gracefully
- Normalize vectors if needed

### 2. BigQuery Storage
- Insert embeddings into knowledge_base.embeddings table
- Deduplicate based on content hash
- Update existing entries if changed
- Maintain metadata consistency

### 3. Search Quality Monitoring
- Track search accuracy metrics
- Identify low-quality embeddings
- Suggest re-embedding old data
- Monitor embedding model updates

## Embedding Configuration

From `config/vertex_config.yaml`:
- **Model**: textembedding-gecko@003
- **Dimensions**: 768
- **Batch size**: 100
- **Location**: us-central1

## Data Flow

```
Text Input
    ↓
Preprocessing (clean, chunk if needed)
    ↓
Generate Embeddings (batched)
    ↓
Content Hash (SHA256)
    ↓
Check Duplicates (BigQuery)
    ↓
Insert/Update BigQuery
    ↓
Backup to GCS
    ↓
Update Metadata
```

## Key Functions

### learn_from_text(text, metadata)
Create embedding and store in Vertex AI

### learn_from_file(file_path, metadata)
Process file and learn contents

### batch_learn(text_list, metadata_list)
Efficiently process multiple texts

### deduplicate_knowledge()
Remove duplicate embeddings from BigQuery

### update_embedding(content_hash, new_text)
Update existing embedding

### monitor_quality()
Check and report RAG quality metrics

## Preprocessing

Before embedding:
1. **Clean text**: Remove excessive whitespace, normalize Unicode
2. **Chunk if needed**: Split texts > 10,000 chars
3. **Add context**: Include metadata in embedding
4. **Validate**: Check for empty or invalid input

## Deduplication Strategy

```python
def deduplicate(text):
    # 1. Generate content hash
    content_hash = hashlib.sha256(text.encode()).hexdigest()

    # 2. Check if exists in BigQuery
    query = f"""
    SELECT content_hash, created_at
    FROM knowledge_base.embeddings
    WHERE content_hash = '{content_hash}'
    LIMIT 1
    """

    # 3. If exists and unchanged, skip
    # 4. If exists but changed, update
    # 5. If new, insert
```

## Quality Monitoring

Metrics tracked:
- **Embedding coverage**: % of content embedded
- **Search hit rate**: % of queries returning results
- **Average relevance**: Mean similarity score
- **Staleness**: Age of oldest embeddings

Thresholds:
- Coverage < 80%: Warning
- Hit rate < 60%: Alert
- Avg relevance < 0.5: Review needed

## Error Handling

- **API Quota**: Implement exponential backoff
- **Invalid Text**: Log and skip, don't fail batch
- **BigQuery Errors**: Retry with smaller batch
- **Network Issues**: Queue for later retry

## Integration Points

### With Skills:
- Called by `github-sync` to embed new content
- Called by `decision-logger` to store decisions
- Provides embeddings to `vertex-search` for queries

### With BigQuery:
- Reads from questions_embeddings (existing)
- Writes to knowledge_base.embeddings (new)
- Runs quality monitoring queries

### With GCS:
- Backs up all embedded content
- Stores metadata separately
- Maintains versioning

## Implementation Script

Location: `.claude/agents/vertex-learner/vertex_learner.py`

Key features:
- Embedding generation
- Batch processing
- Deduplication
- Quality monitoring
- Error recovery

## Example Usage

```bash
# Learn from text
python vertex_learner.py learn \
  --text "New knowledge to learn" \
  --metadata '{"type":"decision","date":"2024-01-01"}'

# Learn from file
python vertex_learner.py learn-file \
  --file docs/brain/DECISIONS.md \
  --type decision

# Batch learn
python vertex_learner.py batch-learn \
  --files "docs/brain/*.md"

# Deduplicate
python vertex_learner.py deduplicate

# Check quality
python vertex_learner.py monitor-quality
```

## Performance Optimization

- **Batching**: Process 100 texts per API call
- **Caching**: Cache embeddings for identical texts
- **Async**: Use async/await for concurrent processing
- **Rate Limiting**: Respect API quotas

## Cost Management

Vertex AI Embeddings pricing:
- $0.025 per 1,000 characters
- With 100MB data (~100,000 words = ~500,000 chars)
- Cost: $0.0125 per upload
- Monthly (assuming 10 uploads): ~$0.13

Very affordable!
