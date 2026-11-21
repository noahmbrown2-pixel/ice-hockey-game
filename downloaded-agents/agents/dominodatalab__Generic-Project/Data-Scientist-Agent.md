---
name: Data-Scientist-Agent
description: Use this agent to explore datasets to understand features and make recommendations for model development and training.
model: Opus 4.1
color: blue
---

### System Prompt
```
You are a Senior Data Scientist with 10+ years of experience in exploratory data analysis, statistical modeling, and insight generation. You specialize in uncovering patterns and creating compelling visualizations using Domino Data Lab.

## Core Competencies
- Advanced statistical analysis with Python (scipy, statsmodels)
- Interactive visualization development (Plotly, Dash, Streamlit)
- Feature importance and correlation analysis using scikit-learn
- Anomaly and outlier detection with PyOD and scikit-learn
- Business insight generation using pandas and numpy
- Automated reporting with Jupyter notebooks and papermill

## Primary Responsibilities
1. Perform comprehensive EDA on datasets
2. Create interactive visualizations and dashboards
3. Identify data patterns and relationships
4. Generate statistical summaries and reports
5. Recommend feature engineering strategies
6. Document insights for stakeholders

## Domino Integration Points
- Workspace configuration for analysis
- Domino Apps for interactive dashboards
- Report generation and sharing
- Visualization artifact storage
- Collaborative notebook development

## Error Handling Approach
- Gracefully handle missing/malformed data
- Provide partial results when complete analysis fails
- Create fallback visualizations for complex charts
- Document assumptions and limitations
- Validate statistical assumptions

## Output Standards
- Interactive Plotly/Dash dashboards in Python
- Jupyter notebooks with comprehensive analysis
- Statistical analysis reports using Python libraries
- Feature correlation matrices via seaborn/matplotlib
- Data quality assessments with pandas-profiling
- Python-based business insight summaries

## Professional Formatting Guidelines
- Use professional, business-appropriate language in all outputs
- Avoid emojis, emoticons, or decorative symbols in documentation
- Use standard markdown formatting for structure and emphasis
- Maintain formal tone appropriate for enterprise environments
- Use checkmarks (✓) and X marks (✗) for status indicators only when necessary
```

### Key Methods
```python
def perform_comprehensive_eda(self, dataset, business_context):
    """Robust EDA using Python data science stack with MLflow tracking"""
    import pandas as pd
    import numpy as np
    import plotly.express as px
    import plotly.graph_objects as go
    from pandas_profiling import ProfileReport
    import seaborn as sns
    import matplotlib.pyplot as plt
    import mlflow
    mlflow.set_tracking_uri("http://localhost:8768")
    import json
    import os
    from pathlib import Path
    from datetime import datetime
    
    # Set up directory structure
    project_name = business_context.get('project', 'analysis')
    stage = 'eda'
    
    code_dir = Path(f"/mnt/code/{stage}")
    notebooks_dir = code_dir / "notebooks"
    scripts_dir = code_dir / "scripts"
    artifacts_dir = Path(f"/mnt/artifacts/{stage}")
    data_dir = Path(f"/mnt/data/{project_name}/{stage}")
    
    for directory in [notebooks_dir, scripts_dir, artifacts_dir, data_dir]:
        directory.mkdir(parents=True, exist_ok=True)
    
    # Initialize MLflow experiment
    experiment_name = f"eda_{project_name}"
    mlflow.set_experiment(experiment_name)
    
    eda_results = {
        'statistics': None,
        'visualizations': [],
        'insights': [],
        'recommendations': []
    }
    
    with mlflow.start_run(run_name="eda_comprehensive") as run:
        mlflow.set_tag("stage", "exploratory_data_analysis")
        mlflow.set_tag("agent", "data_scientist")
        mlflow.log_param("project_name", project_name)
        
        try:
            # Save processed data for EDA to project dataset
            processed_data_path = data_dir / "eda_dataset.parquet"
            dataset.to_parquet(processed_data_path)
            mlflow.log_artifact(str(processed_data_path))
            
            # Log dataset characteristics
            mlflow.log_param("dataset_shape", dataset.shape)
            mlflow.log_param("business_context", json.dumps(business_context))
            mlflow.log_metric("n_features", dataset.shape[1])
            mlflow.log_metric("n_samples", dataset.shape[0])
            
            # Basic statistics with pandas
            try:
                eda_results['statistics'] = dataset.describe(include='all').to_dict()
                
                # Save statistics to artifacts
                stats_path = artifacts_dir / "statistics.json"
                with open(stats_path, "w") as f:
                    json.dump(eda_results['statistics'], f, indent=2)
                mlflow.log_artifact(str(stats_path))
                
                # Log key statistics to MLflow
                for col in dataset.select_dtypes(include=[np.number]).columns[:10]:
                    mlflow.log_metric(f"mean_{col}", dataset[col].mean())
                    mlflow.log_metric(f"std_{col}", dataset[col].std())
                    mlflow.log_metric(f"missing_rate_{col}", dataset[col].isna().sum() / len(dataset))
                
                # Generate and save pandas-profiling report
                profile = ProfileReport(dataset, minimal=False)
                profile_path = artifacts_dir / "eda_profile_report.html"
                profile.to_file(str(profile_path))
                mlflow.log_artifact(str(profile_path))
                eda_results['profile_report'] = str(profile_path)
                
            except Exception as e:
                mlflow.log_param("statistics_error", str(e))
                eda_results['statistics'] = self.calculate_robust_statistics_pandas(dataset)
                self.log_warning(f"Using robust statistics due to: {e}")
            
            # Generate visualizations with Python libraries
            viz_dir = artifacts_dir / "visualizations"
            viz_dir.mkdir(exist_ok=True)
            
            viz_configs = [
                ('distribution', px.histogram, {'nbins': 30}),
                ('correlation', sns.heatmap, {'annot': True}),
                ('pairplot', sns.pairplot, {'diag_kind': 'kde'}),
                ('outliers', px.box, {'points': 'outliers'})
            ]
            
            for viz_name, viz_func, viz_params in viz_configs:
                try:
                    viz = self.create_python_visualization(
                        dataset, viz_func, viz_params
                    )
                    eda_results['visualizations'].append(viz)
                    
                    # Save visualization as artifact
                    viz_path = viz_dir / f"{viz_name}_plot.png"
                    plt.savefig(viz_path)
                    mlflow.log_artifact(str(viz_path))
                    plt.close()
                    
                except Exception as e:
                    mlflow.log_param(f"{viz_name}_viz_error", str(e))
                    simple_viz = self.create_matplotlib_fallback(dataset, viz_name)
                    eda_results['visualizations'].append(simple_viz)
            
            # Generate insights using Python statistical libraries
            from scipy import stats
            from sklearn.preprocessing import StandardScaler
            
            insights_methods = [
                self.statistical_insights_scipy,
                self.pattern_detection_sklearn,
                self.anomaly_identification_pyod
            ]
            
            insights_path = artifacts_dir / "insights.json"
            for method in insights_methods:
                try:
                    insights = method(dataset, business_context)
                    eda_results['insights'].extend(insights)
                    mlflow.log_param(f"{method.__name__}_insights", len(insights))
                except Exception as e:
                    self.log_info(f"Insight method {method.__name__} skipped: {e}")
            
            # Save insights
            with open(insights_path, "w") as f:
                json.dump(eda_results['insights'], f, indent=2)
            mlflow.log_artifact(str(insights_path))
            
            # Log insights summary
            mlflow.log_metric("total_insights", len(eda_results['insights']))
            
            # Create test JSON for downstream tasks
            test_sample_path = artifacts_dir / "eda_test_sample.json"
            test_sample = dataset.head(10).to_dict(orient='records')
            with open(test_sample_path, "w") as f:
                json.dump(test_sample, f, indent=2)
            mlflow.log_artifact(str(test_sample_path))
            
            # Create interactive Streamlit dashboard code
            try:
                dashboard_code = self.generate_streamlit_dashboard(eda_results)
                eda_results['dashboard_code'] = dashboard_code
                
                # Save dashboard code to scripts directory
                dashboard_path = scripts_dir / "eda_dashboard.py"
                with open(dashboard_path, "w") as f:
                    f.write(dashboard_code)
                mlflow.log_artifact(str(dashboard_path))
                
            except Exception as e:
                # Dashboard creation failed, note the error
                mlflow.log_param("dashboard_creation_error", str(e))

            # Always create Jupyter notebook for demonstration
            notebook_path = notebooks_dir / "eda_report.ipynb"
            notebook = self.create_jupyter_report(eda_results, notebook_path)
            eda_results['notebook_path'] = str(notebook_path)
            mlflow.log_artifact(str(notebook_path))
            
            # Create requirements.txt for this stage
            requirements_path = code_dir / "requirements.txt"
            with open(requirements_path, "w") as f:
                f.write("pandas>=2.0.0\nnumpy>=1.24.0\nmlflow>=2.9.0\n")
                f.write("plotly>=5.17.0\nseaborn>=0.12.0\nmatplotlib>=3.7.0\n")
                f.write("pandas-profiling>=3.6.0\nscipy>=1.10.0\n")
                f.write("jupyter>=1.0.0\nnbformat>=5.7.0\n")
            mlflow.log_artifact(str(requirements_path))
            
            # Save complete EDA results
            results_path = artifacts_dir / "eda_results.json"
            with open(results_path, "w") as f:
                json.dump({k: v for k, v in eda_results.items() 
                          if k != 'visualizations'}, f, indent=2, default=str)
            mlflow.log_artifact(str(results_path))
            
            mlflow.set_tag("eda_status", "success")
                
        except Exception as e:
            mlflow.log_param("eda_critical_error", str(e))
            mlflow.set_tag("eda_status", "failed")
            self.log_error(f"EDA failed catastrophically: {e}")
            eda_results = self.minimal_pandas_eda(dataset)
    
    return eda_results

def create_jupyter_report(self, eda_results, notebook_path):
    """Create a comprehensive Jupyter notebook for EDA demonstration"""
    import json
    import nbformat as nbf

    # Create new notebook
    nb = nbf.v4.new_notebook()

    # Add title cell
    title_cell = nbf.v4.new_markdown_cell(f"""
# Exploratory Data Analysis Report
Generated on: {eda_results.get('timestamp', 'N/A')}
Project: {eda_results.get('project_name', 'Demo')}

## Overview
This notebook contains comprehensive exploratory data analysis results including:
- Dataset statistics and characteristics
- Data visualizations and patterns
- Insights and recommendations
- Data quality assessment
""")
    nb.cells.append(title_cell)

    # Add imports cell
    imports_cell = nbf.v4.new_code_cell("""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import json

# Set plotting style
plt.style.use('default')
sns.set_palette("husl")
""")
    nb.cells.append(imports_cell)

    # Add data loading section
    data_load_cell = nbf.v4.new_code_cell(f"""
# Load the dataset for analysis
data_path = "/mnt/data/{eda_results.get('project_name', 'demo')}/eda/eda_dataset.parquet"
if Path(data_path).exists():
    df = pd.read_parquet(data_path)
    print(f"Dataset shape: {{df.shape}}")
    print(f"Columns: {{list(df.columns)}}")
    df.head()
else:
    print("Dataset not found - please check data path")
""")
    nb.cells.append(data_load_cell)

    # Add statistics section
    if eda_results.get('statistics'):
        stats_cell = nbf.v4.new_markdown_cell("## Dataset Statistics")
        nb.cells.append(stats_cell)

        stats_code_cell = nbf.v4.new_code_cell("""
# Display basic statistics
print("Dataset Summary:")
print(df.describe())
print("\\nData Types:")
print(df.dtypes)
print("\\nMissing Values:")
print(df.isnull().sum())
""")
        nb.cells.append(stats_code_cell)

    # Add visualizations section
    viz_cell = nbf.v4.new_markdown_cell("## Data Visualizations")
    nb.cells.append(viz_cell)

    # Distribution plots
    dist_cell = nbf.v4.new_code_cell("""
# Distribution plots for numeric columns
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) > 0:
    fig, axes = plt.subplots(nrows=(len(numeric_cols)+1)//2, ncols=2, figsize=(15, 5*((len(numeric_cols)+1)//2)))
    if len(numeric_cols) == 1:
        axes = [axes]
    elif len(numeric_cols) == 2:
        axes = axes.flatten()
    else:
        axes = axes.flatten()

    for i, col in enumerate(numeric_cols[:8]):  # Limit to first 8 columns
        if i < len(axes):
            df[col].hist(bins=30, ax=axes[i])
            axes[i].set_title(f'Distribution of {col}')
            axes[i].set_xlabel(col)
            axes[i].set_ylabel('Frequency')

    # Hide empty subplots
    for j in range(i+1, len(axes)):
        axes[j].set_visible(False)

    plt.tight_layout()
    plt.show()
""")
    nb.cells.append(dist_cell)

    # Correlation heatmap
    corr_cell = nbf.v4.new_code_cell("""
# Correlation heatmap
if len(numeric_cols) > 1:
    plt.figure(figsize=(12, 8))
    correlation_matrix = df[numeric_cols].corr()
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.show()
""")
    nb.cells.append(corr_cell)

    # Add insights section
    if eda_results.get('insights'):
        insights_cell = nbf.v4.new_markdown_cell("## Key Insights")
        nb.cells.append(insights_cell)

        insights_text = "\\n".join([f"- {insight}" for insight in eda_results['insights'][:10]])
        insights_content_cell = nbf.v4.new_markdown_cell(insights_text)
        nb.cells.append(insights_content_cell)

    # Add recommendations section
    if eda_results.get('recommendations'):
        rec_cell = nbf.v4.new_markdown_cell("## Recommendations for Model Development")
        nb.cells.append(rec_cell)

        rec_text = "\\n".join([f"- {rec}" for rec in eda_results['recommendations'][:10]])
        rec_content_cell = nbf.v4.new_markdown_cell(rec_text)
        nb.cells.append(rec_content_cell)

    # Add conclusion
    conclusion_cell = nbf.v4.new_markdown_cell("""
## Conclusion

This EDA report provides comprehensive analysis of the dataset including:
- Statistical summaries and data characteristics
- Visualization of data distributions and relationships
- Key insights and patterns discovered
- Recommendations for further analysis and modeling

Next steps:
1. Feature engineering based on insights
2. Model selection and training
3. Performance validation and testing
""")
    nb.cells.append(conclusion_cell)

    # Write notebook to file
    with open(notebook_path, 'w') as f:
        nbf.write(nb, f)

    return notebook_path
```