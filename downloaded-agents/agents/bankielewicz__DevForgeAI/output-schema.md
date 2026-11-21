---
## Output Format

**Standard Response Structure:**

```json
{
  "status": "SUCCESS|PARTIAL|FAILED",
  "mode": "story|standalone",
  "timestamp": "ISO8601 timestamp",
  "summary": {
    "title": "User-friendly title",
    "component_count": 0,
    "file_count": 0,
    "validation_issues": 0,
    "validation_warnings": 0
  },
  "components": [
    {
      "name": "ComponentName",
      "type": "Form|DataDisplay|Navigation|Dialog|Chart|Other",
      "framework": "React|Vue|Angular|Blazor|WPF|Tkinter",
      "styling": "StyleLibraryName",
      "accessibility": "WCAG Level",
      "responsive": true|false,
      "features": ["Feature1", "Feature2"],
      "test_scenarios": 0,
      "estimated_dev_time": "hours"
    }
  ],
  "file_summary": {
    "total_files": 0,
    "by_type": {
      "component": 0,
      "style": 0,
      "test": 0,
      "spec": 0
    },
    "total_lines": 0,
    "location": "devforgeai/specs/ui/PATH"
  },
  "framework_details": {
    "framework": "Name Version",
    "styling": "Library Version",
    "testing": "Framework+Library",
    "state_management": "Library or Local"
  },
  "accessibility": {
    "wcag_level": "2.1 A|AA|AAA",
    "keyboard_navigation": true|false,
    "screen_reader_support": true|false,
    "aria_labels": true|false,
    "semantic_html": true|false,
    "color_contrast_compliant": true|false
  },
  "responsive_design": {
    "mobile": { "breakpoint": "Value", "supported": true|false },
    "tablet": { "breakpoint": "Value", "supported": true|false },
    "desktop": { "breakpoint": "Value", "supported": true|false },
    "touch_support": true|false
  },
  "validation": {
    "issues": [ { "severity": "HIGH|MEDIUM|LOW", "message": "" } ],
    "warnings": [],
    "status": "PASSED|FAILED"
  },
  "design_md_validation": {
    "exists": "true|false",
    "path": "devforgeai/specs/ui/design.md",
    "component_count": 0,
    "interaction_count": 0,
    "animation_count": 0,
    "token_normalization_pct": 0,
    "dangling_children_refs": 0,
    "uncovered_callbacks": 0,
    "props_missing_children": 0,
    "status": "PASSED|WARNING|FAILED|N/A"
  },
  "display": {
    "template": "story_success|story_partial|story_failed|standalone_success|standalone_partial|standalone_failed",
    "content": "Full markdown template for user display"
  },
  "implementation_guidance": {
    "components_by_priority": [
      {
        "priority": 1,
        "component": "ComponentName",
        "reason": "Essential|HighPriority|Supporting|Optional",
        "estimated_time": "hours",
        "dependencies": ["pkg1", "pkg2"],
        "test_scenarios": 0
      }
    ],
    "estimated_total_time": "hours",
    "implementation_order": "Suggested order"
  },
  "next_steps": ["Step 1", "Step 2", "Step 3"],
  "spec_file_location": "devforgeai/specs/ui/PATH",
  "generation_time_seconds": 0
}
```

**Display Template Format:**
- Markdown formatted for terminal output
- Status emoji (✅/⚠️/❌) in title
- Sections: Components, Files, Implementation Details, Accessibility, Responsive Design, Next Steps
- Component lists with key features and test scenarios
- File tree structure with counts and locations
- Framework/styling/testing details
- Validation warnings (if PARTIAL status)
- Error explanation (if FAILED status)

---
