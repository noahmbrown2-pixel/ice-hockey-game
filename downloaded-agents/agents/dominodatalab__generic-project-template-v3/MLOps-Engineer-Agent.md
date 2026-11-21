---
name: MLOps-Engineer-Agent
description: Use this agent to productionize ML systems, create deployment pipelines, and ensure reliable model serving with monitoring
model: claude-sonnet-4-5-20250929
color: yellow
tools: ['*']
---

### System Prompt
```
You are a Senior MLOps Engineer with 10+ years of experience in productionizing ML systems, building automation pipelines, and ensuring reliable model deployment. You specialize in Domino Data Lab's enterprise MLOps capabilities.

## Core Competencies
- CI/CD pipeline development for ML
- Model deployment and serving optimization
- Monitoring and observability implementation
- A/B testing and gradual rollout strategies
- Infrastructure as Code (IaC)
- Container orchestration and management

## Primary Responsibilities
1. Create end-to-end automation workflows
2. Implement model deployment strategies
3. Set up monitoring and alerting
4. Design A/B testing frameworks
5. Optimize inference performance
6. Ensure system reliability and scalability
7. Implement governance-compliant deployment pipelines
8. Integrate approval gates and compliance validation

## Domino Integration Points
- Domino Flows for pipeline automation
- Model API configuration and scaling
- Monitoring dashboard creation
- Environment management
- Integration with external systems
- Governance policy compliance in deployment pipelines
- Automated approval workflow integration

## Error Handling Approach
- Implement circuit breakers for model endpoints
- Create rollback mechanisms
- Set up comprehensive logging
- Design graceful degradation strategies
- Implement health checks and readiness probes

## Output Standards
- Python-based deployment scripts
- FastAPI/Flask model serving applications
- Docker configurations with Python environments
- CI/CD pipeline definitions (Jenkins, GitLab CI)
- Python-based monitoring scripts
- Performance optimization reports
- SRE documentation with Python code examples

## Professional Formatting Guidelines
- Use professional, business-appropriate language in all outputs
- Avoid emojis, emoticons, or decorative symbols in documentation
- Use standard markdown formatting for structure and emphasis
- Maintain formal tone appropriate for enterprise environments
- Use checkmarks (✓) and X marks (✗) for status indicators only when necessary
```

### Key Methods
```python
def create_production_pipeline(self, components, requirements):
    """Build robust production pipeline with MLflow tracking and comprehensive safeguards"""
    import mlflow
    import mlflow.pyfunc
    mlflow.set_tracking_uri("http://localhost:8768")
    import json
    from datetime import datetime
    
    # Initialize MLflow experiment for deployment
    experiment_name = f"e006_mlops_deployment_{requirements.get('project', 'prod')}"
    mlflow.set_experiment(experiment_name)
    
    pipeline = {
        'stages': [],
        'monitoring': {},
        'rollback_plan': {},
        'health_checks': []
    }
    
    with mlflow.start_run(run_name="production_pipeline_setup") as run:
        mlflow.set_tag("stage", "e006_mlops_deployment")
        mlflow.set_tag("agent", "e006_mlops_engineer")
        
        try:
            # Log deployment requirements
            mlflow.log_params({
                "deployment_strategy": requirements.get('deployment_strategy', 'canary'),
                "initial_traffic": requirements.get('initial_traffic', 0.1),
                "sla_latency_ms": requirements.get('sla', {}).get('latency', 100),
                "sla_availability": requirements.get('sla', {}).get('availability', 0.999)
            })
            
            # Data validation stage
            pipeline['stages'].append(
                self.create_data_validation_stage(
                    input_schema=components['data_schema'],
                    validation_rules=requirements.get('validation_rules', 'strict')
                )
            )
            mlflow.log_dict(components['data_schema'], "data_schema.json")
            
            # Model deployment with canary release
            deployment_config = self.create_deployment_config(
                model=components['model'],
                strategy=requirements.get('deployment_strategy', 'canary'),
                traffic_split=requirements.get('initial_traffic', 0.1)
            )
            pipeline['stages'].append(deployment_config)
            
            # Create MLflow model serving configuration
            model_serving_config = {
                "name": f"{components['model'].__class__.__name__}_api",
                "implementation": "mlflow",
                "config": {
                    "model_uri": f"models:/{components.get('model_name', 'model')}/latest",
                    "flavor": "sklearn",
                    "signature": {
                        "inputs": components.get('input_schema', {}),
                        "outputs": components.get('output_schema', {})
                    }
                }
            }
            mlflow.log_dict(model_serving_config, "model_serving_config.json")
            
            # Create API endpoint configuration
            api_config = f'''
import mlflow.pyfunc
mlflow.set_tracking_uri("http://localhost:8768")
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import json

app = FastAPI(title="Model API", version="1.0")

# Load model from MLflow registry
model = mlflow.pyfunc.load_model("models:/{components.get('model_name', 'model')}/latest")

class PredictionRequest(BaseModel):
    data: dict

class PredictionResponse(BaseModel):
    prediction: list
    model_version: str
    confidence: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Convert input to DataFrame
        df = pd.DataFrame([request.data])
        
        # Make prediction
        prediction = model.predict(df)
        
        # Get confidence if available
        confidence = 0.0
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(df)
            confidence = float(np.max(proba))
        
        return PredictionResponse(
            prediction=prediction.tolist(),
            model_version=model.metadata.run_id,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {{"status": "healthy", "model_loaded": model is not None}}
'''
            
            with open("api_endpoint.py", "w") as f:
                f.write(api_config)
            mlflow.log_artifact("api_endpoint.py")
            
            # Monitoring and alerting setup with MLflow tracking
            pipeline['monitoring'] = self.setup_comprehensive_monitoring(
                metrics=['latency', 'throughput', 'error_rate', 'drift'],
                alerting_thresholds=requirements.get('sla', self.default_sla)
            )
            
            # Create monitoring configuration
            monitoring_config = {
                "metrics": {
                    "performance": ["latency_p50", "latency_p95", "latency_p99", "throughput"],
                    "accuracy": ["prediction_accuracy", "false_positive_rate", "false_negative_rate"],
                    "drift": ["feature_drift", "prediction_drift", "concept_drift"],
                    "system": ["cpu_usage", "memory_usage", "disk_io", "network_io"]
                },
                "alerting": {
                    "channels": ["email", "slack", "pagerduty"],
                    "rules": [
                        {"metric": "latency_p99", "threshold": 1000, "condition": ">"},
                        {"metric": "error_rate", "threshold": 0.05, "condition": ">"},
                        {"metric": "feature_drift", "threshold": 0.3, "condition": ">"}
                    ]
                },
                "logging": {
                    "level": "INFO",
                    "destinations": ["mlflow", "cloudwatch", "datadog"]
                }
            }
            mlflow.log_dict(monitoring_config, "monitoring_config.json")
            
            # Automated rollback conditions
            pipeline['rollback_plan'] = self.define_rollback_conditions(
                error_threshold=0.05,
                latency_threshold=1000,  # ms
                automatic_rollback=True
            )
            mlflow.log_dict(pipeline['rollback_plan'], "rollback_plan.json")
            
            # Health checks
            pipeline['health_checks'] = [
                self.create_health_check('model_availability'),
                self.create_health_check('data_pipeline'),
                self.create_health_check('feature_store')
            ]
            
            # Create test suite for deployment validation
            test_suite = {
                "smoke_tests": [
                    {
                        "name": "single_prediction",
                        "input": components.get('test_data', {}).get('single_prediction', {}),
                        "expected_output_format": {"prediction": "array", "confidence": "float"}
                    },
                    {
                        "name": "batch_prediction",
                        "input": components.get('test_data', {}).get('batch_predictions', []),
                        "expected_output_format": {"predictions": "array"}
                    }
                ],
                "load_tests": {
                    "concurrent_users": 100,
                    "duration_seconds": 300,
                    "target_rps": 1000
                },
                "integration_tests": {
                    "data_pipeline": True,
                    "feature_store": True,
                    "model_registry": True
                }
            }
            
            with open("deployment_test_suite.json", "w") as f:
                json.dump(test_suite, f, indent=2)
            mlflow.log_artifact("deployment_test_suite.json")
            
            # Create Domino Flow configuration
            domino_flow_config = {
                "name": f"ml_pipeline_{requirements.get('project', 'default')}",
                "stages": [
                    {"name": "data_validation", "compute_tier": "small"},
                    {"name": "feature_engineering", "compute_tier": "medium"},
                    {"name": "model_scoring", "compute_tier": "gpu_small"},
                    {"name": "post_processing", "compute_tier": "small"}
                ],
                "schedule": requirements.get('schedule', 'on_demand'),
                "notifications": {
                    "on_success": ["email"],
                    "on_failure": ["email", "slack"]
                }
            }
            mlflow.log_dict(domino_flow_config, "domino_flow_config.json")
            
            # Deploy to Domino Flows
            domino_flow = self.deploy_to_domino_flows(pipeline)
            
            # Log deployment metrics
            mlflow.log_metrics({
                "deployment_stages": len(pipeline['stages']),
                "health_checks": len(pipeline['health_checks']),
                "monitoring_metrics": len(monitoring_config['metrics']),
                "alerting_rules": len(monitoring_config['alerting']['rules'])
            })
            
            mlflow.set_tag("deployment_status", "success")
            mlflow.set_tag("domino_flow_id", domino_flow.id)

            # Extract reusable deployment code to src/ directory
            deployment_utils = self.extract_deployment_code_to_src(pipeline, requirements)
            mlflow.log_dict(deployment_utils, "deployment_utils_extracted.json")

            return {
                'pipeline': pipeline,
                'domino_flow_id': domino_flow.id,
                'monitoring_dashboard': self.create_monitoring_dashboard(pipeline),
                'documentation': self.generate_ops_documentation(pipeline),
                'mlflow_run_id': run.info.run_id,
                'deployment_utils': deployment_utils
            }
            
        except Exception as e:
            mlflow.log_param("deployment_error", str(e))
            mlflow.set_tag("deployment_status", "failed")
            self.log_error(f"Pipeline creation failed: {e}")
            # Return minimal viable pipeline
            return self.create_minimal_pipeline(components)

def extract_deployment_code_to_src(self, pipeline, requirements):
    """Extract reusable deployment and MLOps utilities to /mnt/code/src/ for production use"""
    import os
    from pathlib import Path

    project_name = requirements.get('project', 'default')
    src_dir = Path('/mnt/code/src')
    src_dir.mkdir(exist_ok=True)

    # Create project-specific subdirectory
    project_src_dir = src_dir / project_name
    project_src_dir.mkdir(exist_ok=True)

    # Create deployment utilities module
    deployment_module = project_src_dir / 'deployment.py'
    monitoring_module = project_src_dir / 'monitoring.py'
    serving_module = project_src_dir / 'serving.py'

    print(f"\nExtracting deployment utilities to /mnt/code/src/{project_name}/")

    # Create deployment.py with deployment utilities
    deployment_content = f'''"""
Deployment Utilities

Reusable deployment functions for ML models in production.
Project: {project_name}
"""

import mlflow
import json
from datetime import datetime
from pathlib import Path

# Set MLflow tracking URI
mlflow.set_tracking_uri("http://localhost:8768")


def load_model_from_registry(model_name, stage='Production'):
    """
    Load a model from MLflow model registry by name and stage.

    Args:
        model_name: Name of the registered model
        stage: Model stage (Production, Staging, None)

    Returns:
        Loaded MLflow model
    """
    model_uri = f"models:/{model_name}/{stage}"
    model = mlflow.pyfunc.load_model(model_uri)
    return model


def validate_input_data(data, schema):
    """
    Validate input data against expected schema.

    Args:
        data: Input data (pandas DataFrame or dict)
        schema: Expected schema dictionary

    Returns:
        bool: True if valid, raises ValueError otherwise
    """
    import pandas as pd

    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame([data])

    # Check required columns
    required_cols = schema.get('required_columns', [])
    missing_cols = set(required_cols) - set(data.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    # Check data types
    for col, expected_type in schema.get('column_types', {}).items():
        if col in data.columns:
            if not data[col].dtype == expected_type:
                try:
                    data[col] = data[col].astype(expected_type)
                except:
                    raise ValueError(f"Column {col} cannot be converted to {expected_type}")

    return True


def create_prediction_payload(model, data):
    """
    Create a prediction payload with metadata.

    Args:
        model: Loaded model
        data: Input data

    Returns:
        dict: Prediction results with metadata
    """
    import pandas as pd

    start_time = datetime.now()
    predictions = model.predict(pd.DataFrame([data]) if isinstance(data, dict) else data)
    end_time = datetime.now()

    latency_ms = (end_time - start_time).total_seconds() * 1000

    return {{
        'predictions': predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
        'metadata': {{
            'timestamp': end_time.isoformat(),
            'latency_ms': latency_ms,
            'model_version': getattr(model, 'metadata', {{}}).get('version', 'unknown')
        }}
    }}


def deploy_model_api(model_name, port=8000, stage='Production'):
    """
    Deploy model as FastAPI endpoint.

    Args:
        model_name: Name of the model in registry
        port: Port to serve on
        stage: Model stage to deploy

    Returns:
        FastAPI app instance
    """
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import pandas as pd

    app = FastAPI(title=f"{{model_name}} API")
    model = load_model_from_registry(model_name, stage)

    class PredictionRequest(BaseModel):
        data: dict

    @app.post("/predict")
    async def predict(request: PredictionRequest):
        try:
            result = create_prediction_payload(model, request.data)
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.get("/health")
    async def health():
        return {{"status": "healthy", "model": model_name, "stage": stage}}

    return app


def rollback_deployment(model_name, previous_version):
    """
    Rollback a model deployment to a previous version.

    Args:
        model_name: Name of the model
        previous_version: Version number to rollback to
    """
    from mlflow.tracking import MlflowClient

    client = MlflowClient()

    # Transition previous version to Production
    client.transition_model_version_stage(
        name=model_name,
        version=previous_version,
        stage="Production"
    )

    print(f"Rolled back {{model_name}} to version {{previous_version}}")


def create_deployment_manifest(model_name, version, config):
    """
    Create a deployment manifest file.

    Args:
        model_name: Name of the model
        version: Model version
        config: Deployment configuration

    Returns:
        Path to manifest file
    """
    manifest = {{
        'model_name': model_name,
        'version': version,
        'deployed_at': datetime.now().isoformat(),
        'config': config
    }}

    manifest_path = Path(f'deployment_manifest_{{model_name}}_{{version}}.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    return str(manifest_path)
'''

    with open(deployment_module, 'w') as f:
        f.write(deployment_content)
    print(f"  ✓ Created deployment.py with deployment utilities")

    # Create monitoring.py with monitoring utilities
    monitoring_content = f'''"""
Monitoring Utilities

Reusable monitoring functions for ML models in production.
Project: {project_name}
"""

import mlflow
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

mlflow.set_tracking_uri("http://localhost:8768")


def log_prediction_metrics(predictions, actuals=None, model_name=None):
    """
    Log prediction metrics to MLflow.

    Args:
        predictions: Model predictions
        actuals: Actual values (optional)
        model_name: Name of the model
    """
    with mlflow.start_run(run_name=f"monitoring_{{model_name}}_{{datetime.now().strftime('%Y%m%d_%H%M%S')}}"):
        mlflow.set_tag("monitoring_type", "predictions")
        mlflow.log_metric("prediction_count", len(predictions))

        if actuals is not None:
            from sklearn.metrics import mean_squared_error, r2_score
            mse = mean_squared_error(actuals, predictions)
            r2 = r2_score(actuals, predictions)

            mlflow.log_metric("mse", mse)
            mlflow.log_metric("r2_score", r2)


def detect_data_drift(reference_data, current_data, threshold=0.1):
    """
    Detect data drift between reference and current datasets.

    Args:
        reference_data: Reference dataset (pandas DataFrame)
        current_data: Current dataset (pandas DataFrame)
        threshold: Drift threshold

    Returns:
        dict: Drift detection results
    """
    from scipy.stats import ks_2samp

    drift_results = {{}}

    for column in reference_data.columns:
        if column in current_data.columns:
            # Perform Kolmogorov-Smirnov test
            statistic, pvalue = ks_2samp(
                reference_data[column].dropna(),
                current_data[column].dropna()
            )

            drifted = pvalue < threshold
            drift_results[column] = {{
                'statistic': statistic,
                'pvalue': pvalue,
                'drifted': drifted
            }}

    return drift_results


def calculate_model_performance_metrics(y_true, y_pred, model_type='classification'):
    """
    Calculate comprehensive performance metrics.

    Args:
        y_true: True labels
        y_pred: Predicted labels
        model_type: 'classification' or 'regression'

    Returns:
        dict: Performance metrics
    """
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score, f1_score,
        mean_squared_error, mean_absolute_error, r2_score
    )

    if model_type == 'classification':
        return {{
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted'),
            'recall': recall_score(y_true, y_pred, average='weighted'),
            'f1_score': f1_score(y_true, y_pred, average='weighted')
        }}
    else:
        return {{
            'mse': mean_squared_error(y_true, y_pred),
            'mae': mean_absolute_error(y_true, y_pred),
            'r2_score': r2_score(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred))
        }}


def create_performance_alert(metric_name, current_value, threshold, alert_type='slack'):
    """
    Create an alert when performance degrades.

    Args:
        metric_name: Name of the metric
        current_value: Current metric value
        threshold: Alert threshold
        alert_type: Type of alert ('slack', 'email', 'log')

    Returns:
        dict: Alert details
    """
    alert = {{
        'metric': metric_name,
        'current_value': current_value,
        'threshold': threshold,
        'triggered_at': datetime.now().isoformat(),
        'severity': 'high' if current_value > threshold * 1.5 else 'medium'
    }}

    if alert_type == 'log':
        print(f"ALERT: {{metric_name}} = {{current_value}} exceeded threshold {{threshold}}")

    return alert


def monitor_prediction_latency(latencies, threshold_ms=100):
    """
    Monitor prediction latency and identify anomalies.

    Args:
        latencies: List of latency measurements (milliseconds)
        threshold_ms: Latency threshold in milliseconds

    Returns:
        dict: Latency monitoring results
    """
    latencies = np.array(latencies)

    return {{
        'mean_latency_ms': np.mean(latencies),
        'p50_latency_ms': np.percentile(latencies, 50),
        'p95_latency_ms': np.percentile(latencies, 95),
        'p99_latency_ms': np.percentile(latencies, 99),
        'max_latency_ms': np.max(latencies),
        'threshold_violations': np.sum(latencies > threshold_ms),
        'violation_rate': np.sum(latencies > threshold_ms) / len(latencies)
    }}


def check_model_health(model_name, time_window_hours=24):
    """
    Check overall model health based on recent metrics.

    Args:
        model_name: Name of the model
        time_window_hours: Time window for health check

    Returns:
        dict: Health status
    """
    # This is a template - implement based on your monitoring system
    return {{
        'model_name': model_name,
        'status': 'healthy',
        'checked_at': datetime.now().isoformat(),
        'time_window_hours': time_window_hours,
        'metrics': {{
            'prediction_count': 0,
            'error_rate': 0.0,
            'average_latency_ms': 0.0
        }}
    }}
'''

    with open(monitoring_module, 'w') as f:
        f.write(monitoring_content)
    print(f"  ✓ Created monitoring.py with monitoring utilities")

    # Create serving.py with model serving utilities
    serving_content = f'''"""
Model Serving Utilities

Reusable functions for serving ML models in production.
Project: {project_name}
"""

import mlflow
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from datetime import datetime
import logging

mlflow.set_tracking_uri("http://localhost:8768")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelServer:
    """Production-ready model server with monitoring and error handling."""

    def __init__(self, model_name, stage='Production'):
        self.model_name = model_name
        self.stage = stage
        self.model = None
        self.prediction_count = 0
        self.error_count = 0
        self.load_model()

    def load_model(self):
        """Load model from MLflow registry."""
        try:
            model_uri = f"models:/{{self.model_name}}/{{self.stage}}"
            self.model = mlflow.pyfunc.load_model(model_uri)
            logger.info(f"Loaded model {{self.model_name}} from stage {{self.stage}}")
        except Exception as e:
            logger.error(f"Failed to load model: {{e}}")
            raise

    def predict(self, data):
        """Make prediction with error handling and monitoring."""
        try:
            start_time = datetime.now()

            # Convert to DataFrame if needed
            if isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = pd.DataFrame(data)

            # Make prediction
            prediction = self.model.predict(df)

            # Calculate latency
            latency_ms = (datetime.now() - start_time).total_seconds() * 1000

            self.prediction_count += 1

            return {{
                'prediction': prediction.tolist() if hasattr(prediction, 'tolist') else prediction,
                'latency_ms': latency_ms,
                'timestamp': datetime.now().isoformat()
            }}

        except Exception as e:
            self.error_count += 1
            logger.error(f"Prediction failed: {{e}}")
            raise

    def health_check(self):
        """Return health status of the server."""
        return {{
            'status': 'healthy' if self.model is not None else 'unhealthy',
            'model_name': self.model_name,
            'stage': self.stage,
            'prediction_count': self.prediction_count,
            'error_count': self.error_count,
            'error_rate': self.error_count / max(self.prediction_count, 1)
        }}


def create_fastapi_app(model_name, stage='Production'):
    """
    Create a FastAPI application for model serving.

    Args:
        model_name: Name of the model
        stage: Model stage

    Returns:
        FastAPI app instance
    """
    app = FastAPI(title=f"{{model_name}} Serving API")
    server = ModelServer(model_name, stage)

    class PredictionRequest(BaseModel):
        data: dict

    @app.post("/predict")
    async def predict(request: PredictionRequest):
        try:
            result = server.predict(request.data)
            return JSONResponse(content=result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/health")
    async def health():
        return server.health_check()

    @app.get("/metrics")
    async def metrics():
        return {{
            'prediction_count': server.prediction_count,
            'error_count': server.error_count,
            'error_rate': server.error_count / max(server.prediction_count, 1)
        }}

    return app


def batch_predict(model_name, input_data, batch_size=100):
    """
    Perform batch predictions efficiently.

    Args:
        model_name: Name of the model
        input_data: Input data (DataFrame or list of dicts)
        batch_size: Batch size for processing

    Returns:
        Array of predictions
    """
    model = mlflow.pyfunc.load_model(f"models:/{{model_name}}/Production")

    if isinstance(input_data, list):
        input_data = pd.DataFrame(input_data)

    predictions = []
    for i in range(0, len(input_data), batch_size):
        batch = input_data.iloc[i:i+batch_size]
        batch_pred = model.predict(batch)
        predictions.extend(batch_pred)

    return np.array(predictions)
'''

    with open(serving_module, 'w') as f:
        f.write(serving_content)
    print(f"  ✓ Created serving.py with model serving utilities")

    # Update __init__.py to include deployment modules
    init_file = project_src_dir / '__init__.py'
    with open(init_file, 'a') as f:
        f.write('\n# Deployment and MLOps utilities\n')
        f.write('from . import deployment\n')
        f.write('from . import monitoring\n')
        f.write('from . import serving\n')

    print(f"\nDeployment utilities extraction complete: /mnt/code/src/{project_name}/\n")

    return {{
        'modules_created': ['deployment.py', 'monitoring.py', 'serving.py'],
        'location': str(project_src_dir),
        'utilities': {{
            'deployment_functions': ['load_model_from_registry', 'validate_input_data', 'deploy_model_api', 'rollback_deployment'],
            'monitoring_functions': ['log_prediction_metrics', 'detect_data_drift', 'calculate_model_performance_metrics', 'monitor_prediction_latency'],
            'serving_classes': ['ModelServer'],
            'serving_functions': ['create_fastapi_app', 'batch_predict']
        }}
    }}
```