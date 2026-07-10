---
name: Agent-Interaction-Protocol
description: Reference documentation for agent communication patterns - not an executable agent
model: none
color: gray
---

### Communication Format
```python
class AgentMessage:
    def __init__(self, sender, recipient, message_type, payload):
        self.sender = sender
        self.recipient = recipient
        self.message_type = message_type  # 'request', 'response', 'status', 'error'
        self.payload = payload
        self.timestamp = datetime.now()
        self.correlation_id = str(uuid.uuid4())
        
class AgentResponse:
    def __init__(self, status, data, errors=None, warnings=None):
        self.status = status  # 'success', 'partial', 'failed'
        self.data = data
        self.errors = errors or []
        self.warnings = warnings or []
        self.metadata = {}
```

### Orchestration Example
```python
# Project Manager orchestrating a complete workflow
pm = ProjectManagerAgent()
requirements = pm.gather_requirements(user_input)

# Phase 1: Data Acquisition
data_task = AgentMessage(
    sender='project_manager',
    recipient='data_wrangler',
    message_type='request',
    payload={'task': 'acquire_data', 'specs': requirements['data']}
)
data_response = data_wrangler.handle(data_task)

# Phase 2: EDA (if data acquisition successful)
if data_response.status in ['success', 'partial']:
    eda_task = AgentMessage(
        sender='project_manager',
        recipient='data_scientist',
        message_type='request',
        payload={'task': 'perform_eda', 'data': data_response.data}
    )
    eda_response = data_scientist.handle(eda_task)

# Continue through remaining phases...
```

### Cross-Agent Communication via Pipeline Context

All agents now use a shared pipeline context for seamless communication and state management:

```python
import sys
sys.path.insert(0, '/mnt/code/.context')
from agent_context import PipelineContext

# Example: Data Wrangler Agent completing its stage
def execute_data_wrangling(task):
    """Data wrangling agent execution with context management"""
    import mlflow
    mlflow.set_tracking_uri("http://localhost:8768")

    # Get pipeline context from task
    project_name = task.get('project_name', 'default')
    pipeline_context = task.get('pipeline_context') or PipelineContext(project_name)

    # Read any required inputs from global metadata
    requirements = pipeline_context.get_global_metadata('requirements', {})

    try:
        # Do the data wrangling work
        data_path = '/mnt/data/project/cleaned_data.csv'
        dataset_info = {
            'path': data_path,
            'rows': 10000,
            'columns': 25,
            'schema': {'feature1': 'float64', 'feature2': 'int64'},
            'missing_values': 0.02
        }

        # Complete stage and share outputs
        pipeline_context.complete_stage('data_wrangling', {
            'data_path': data_path,
            'dataset_info': dataset_info,
            'status': 'success'
        })

        return {'success': True, 'data_path': data_path, 'dataset_info': dataset_info}

    except Exception as e:
        pipeline_context.fail_stage('data_wrangling', str(e))
        raise


# Example: Data Scientist Agent reading previous stage outputs
def execute_data_exploration(task):
    """Data scientist agent execution reading from context"""
    import mlflow
    mlflow.set_tracking_uri("http://localhost:8768")

    # Get pipeline context
    project_name = task.get('project_name', 'default')
    pipeline_context = task.get('pipeline_context') or PipelineContext(project_name)

    # Check if data wrangling is completed
    wrangling_status = pipeline_context.get_stage_status('data_wrangling')
    if wrangling_status != 'completed':
        raise ValueError("Data wrangling must be completed before exploration")

    # Read outputs from data wrangling stage
    wrangling_output = pipeline_context.get_stage_output('data_wrangling')
    data_path = wrangling_output['data_path']
    dataset_info = wrangling_output['dataset_info']

    try:
        # Perform EDA using the data from previous stage
        eda_results = {
            'visualizations': ['/mnt/artifacts/eda/correlation_matrix.png'],
            'insights': ['Strong correlation between feature1 and target'],
            'recommended_features': ['feature1', 'feature3', 'feature7']
        }

        # Complete stage and share outputs
        pipeline_context.complete_stage('data_exploration', {
            'eda_results': eda_results,
            'data_path': data_path,  # Pass along for next stage
            'status': 'success'
        })

        return {'success': True, 'eda_results': eda_results}

    except Exception as e:
        pipeline_context.fail_stage('data_exploration', str(e))
        raise


# Example: Model Developer Agent using multiple previous stages
def execute_model_development(task):
    """Model developer agent using context from multiple stages"""
    import mlflow
    mlflow.set_tracking_uri("http://localhost:8768")

    # Get pipeline context
    project_name = task.get('project_name', 'default')
    pipeline_context = task.get('pipeline_context') or PipelineContext(project_name)

    # Check dependencies
    from agent_context import check_dependencies_ready

    ready, missing = check_dependencies_ready(
        pipeline_context,
        required_stages=['data_wrangling', 'data_exploration']
    )

    if not ready:
        raise ValueError(f"Missing required stages: {missing}")

    # Get outputs from all previous stages
    all_outputs = pipeline_context.get_all_stage_outputs()

    # Extract what we need
    data_path = all_outputs['data_wrangling']['data_path']
    recommended_features = all_outputs['data_exploration']['eda_results']['recommended_features']

    try:
        # Train model using insights from previous stages
        model_info = {
            'model_type': 'XGBoost',
            'features_used': recommended_features,
            'accuracy': 0.92,
            'mlflow_run_id': 'run_12345'
        }

        # Store model info in global metadata for other agents
        pipeline_context.set_global_metadata('best_model_info', model_info)

        # Complete stage
        pipeline_context.complete_stage('model_development', {
            'model_info': model_info,
            'status': 'success'
        })

        return {'success': True, 'model_info': model_info}

    except Exception as e:
        pipeline_context.fail_stage('model_development', str(e))
        raise


# Example: Getting pipeline summary
def get_pipeline_status(project_name):
    """Get complete pipeline status"""
    pipeline_context = PipelineContext(project_name)
    summary = pipeline_context.get_pipeline_summary()

    print(f"Project: {summary['project_name']}")
    print(f"Total stages: {summary['total_stages']}")
    print(f"Completed: {summary['completed_stages']}")
    print(f"Failed: {summary['failed_stages']}")

    for stage_name, stage_info in summary['stages'].items():
        print(f"  {stage_name}: {stage_info['status']}")

    return summary
```

### Context Management Best Practices

1. **Always use the context provided in task**: Access via `task.get('pipeline_context')`
2. **Complete stages explicitly**: Call `complete_stage()` with all relevant outputs
3. **Handle failures**: Call `fail_stage()` in exception handlers
4. **Check dependencies**: Use `check_dependencies_ready()` before starting work
5. **Share data paths, not data**: Store file paths and metadata, not large datasets
6. **Use global metadata for shared config**: Store project-wide settings once
7. **Export context for debugging**: Use `export_context()` at key milestones
```