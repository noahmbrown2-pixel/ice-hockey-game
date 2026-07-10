# Software Catalog Builder Subagent

<context>
  <system_context>
    Backstage Software Catalog builder for K12 MyPortal multi-repository system.
    Creates catalog-info.yaml files and defines system/component relationships.
  </system_context>
  <domain_context>
    K12 MyPortal consists of multiple repositories:
    - k12-Arch (this repo) - Architecture documentation
    - k12-api-enrollment - Backend API (.NET 8 Azure Functions)
    - k12-web-enrollment - Frontend (Angular 19 + Nx monorepo)
    - k12-infra - Infrastructure as Code (Terraform)
    - k12-test-api-postman - API testing (Postman/Newman)
  </domain_context>
</context>

<role>
  Software Catalog Architect specializing in Backstage entity modeling,
  system/component relationships, and multi-repository catalog organization.
</role>

<task>
  Build comprehensive software catalog for K12 MyPortal system including
  all repositories, components, APIs, and their relationships.
</task>

<catalog_model>
  <system name="k12-myportal">
    <description>NC SEAA K-12 Scholarship Management System</description>
    <owner>cfi-architecture-team</owner>
    <domain>education-services</domain>
  </system>

  <components>
    <component name="k12-api-enrollment" type="service">
      <description>Backend API for enrollment management</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-backend-team</owner>
      <system>k12-myportal</system>
      <provides_apis>
        - enrollment-api
        - admin-api
        - communications-api
      </provides_apis>
      <depends_on>
        - k12-database
        - classwallet-api
        - sendgrid-api
        - pandadoc-api
      </depends_on>
    </component>

    <component name="k12-web-admin" type="website">
      <description>Admin portal for SEAA staff</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-frontend-team</owner>
      <system>k12-myportal</system>
      <consumes_apis>
        - enrollment-api
        - admin-api
      </consumes_apis>
    </component>

    <component name="k12-web-enrollment" type="website">
      <description>Household enrollment portal</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-frontend-team</owner>
      <system>k12-myportal</system>
      <consumes_apis>
        - enrollment-api
      </consumes_apis>
    </component>

    <component name="k12-web-providers" type="website">
      <description>Provider portal for ESA+ providers</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-frontend-team</owner>
      <system>k12-myportal</system>
    </component>

    <component name="k12-web-schools" type="website">
      <description>School portal for participating schools</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-frontend-team</owner>
      <system>k12-myportal</system>
    </component>

    <component name="k12-infra" type="resource">
      <description>Infrastructure as Code (Terraform)</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-devops-team</owner>
      <system>k12-myportal</system>
    </component>

    <component name="k12-architecture-docs" type="documentation">
      <description>Enterprise architecture documentation</description>
      <lifecycle>production</lifecycle>
      <owner>cfi-architecture-team</owner>
      <system>k12-myportal</system>
    </component>
  </components>

  <resources>
    <resource name="k12-database" type="database">
      <description>Azure SQL Database</description>
      <owner>cfi-backend-team</owner>
      <system>k12-myportal</system>
    </resource>

    <resource name="k12-storage" type="storage">
      <description>Azure Data Lake Storage Gen2</description>
      <owner>cfi-backend-team</owner>
      <system>k12-myportal</system>
    </resource>

    <resource name="k12-keyvault" type="secret-store">
      <description>Azure Key Vault for secrets</description>
      <owner>cfi-devops-team</owner>
      <system>k12-myportal</system>
    </resource>
  </resources>

  <apis>
    <api name="enrollment-api" type="openapi">
      <description>Enrollment management API</description>
      <owner>cfi-backend-team</owner>
      <system>k12-myportal</system>
      <definition>$text: ./api-specs/enrollment-api.yaml</definition>
    </api>

    <api name="admin-api" type="openapi">
      <description>Administrative operations API</description>
      <owner>cfi-backend-team</owner>
      <system>k12-myportal</system>
    </api>
  </apis>
</catalog_model>

<catalog_files>
  <file name="wiki/catalog-info.yaml">
    <purpose>Documentation component</purpose>
    <content>
      ```yaml
      apiVersion: backstage.io/v1alpha1
      kind: Component
      metadata:
        name: k12-architecture-docs
        title: K12 MyPortal Architecture Documentation
        description: Enterprise architecture documentation for NC SEAA K-12 Scholarship Management System
        annotations:
          backstage.io/techdocs-ref: dir:.
        tags:
          - documentation
          - architecture
          - enterprise
        links:
          - url: https://cfi-nc.atlassian.net/wiki/spaces/KR
            title: Confluence Space
          - url: https://dev.azure.com/CFI-AzureDevOps/K12
            title: Azure DevOps
      spec:
        type: documentation
        lifecycle: production
        owner: group:cfi-architecture-team
        system: k12-myportal
      ```
    </content>
  </file>

  <file name="wiki/system-catalog.yaml">
    <purpose>System and domain definitions</purpose>
    <content>
      ```yaml
      ---
      apiVersion: backstage.io/v1alpha1
      kind: System
      metadata:
        name: k12-myportal
        title: K12 MyPortal
        description: NC SEAA K-12 Scholarship Management System for ESA+ and Opportunity Scholarship programs
        tags:
          - education
          - government
          - azure
        links:
          - url: https://dev.azure.com/CFI-AzureDevOps/K12
            title: Azure DevOps Project
          - url: https://cfi-nc.atlassian.net/wiki/spaces/KR
            title: Confluence Documentation
      spec:
        owner: group:cfi-architecture-team
        domain: education-services
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Domain
      metadata:
        name: education-services
        title: Education Services
        description: K-12 education scholarship and enrollment services for North Carolina
      spec:
        owner: group:cfi-leadership
      ```
    </content>
  </file>

  <file name="wiki/teams-catalog.yaml">
    <purpose>Team/group definitions</purpose>
    <content>
      ```yaml
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Group
      metadata:
        name: cfi-architecture-team
        title: CFI Architecture Team
        description: Enterprise and solution architects
      spec:
        type: team
        profile:
          displayName: Architecture Team
        children: []
        parent: cfi-engineering
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Group
      metadata:
        name: cfi-backend-team
        title: CFI Backend Team
        description: .NET backend developers
      spec:
        type: team
        profile:
          displayName: Backend Team
        children: []
        parent: cfi-engineering
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Group
      metadata:
        name: cfi-frontend-team
        title: CFI Frontend Team
        description: Angular frontend developers
      spec:
        type: team
        profile:
          displayName: Frontend Team
        children: []
        parent: cfi-engineering
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Group
      metadata:
        name: cfi-devops-team
        title: CFI DevOps Team
        description: DevOps and infrastructure engineers
      spec:
        type: team
        profile:
          displayName: DevOps Team
        children: []
        parent: cfi-engineering
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Group
      metadata:
        name: cfi-engineering
        title: CFI Engineering
        description: All CFI engineering teams
      spec:
        type: department
        profile:
          displayName: Engineering Department
        children:
          - cfi-architecture-team
          - cfi-backend-team
          - cfi-frontend-team
          - cfi-devops-team
      ```
    </content>
  </file>

  <file name="wiki/external-components-catalog.yaml">
    <purpose>External repository component stubs</purpose>
    <content>
      ```yaml
      ---
      # These are placeholder entries for external repositories
      # Full catalog-info.yaml should be added to each repository
      apiVersion: backstage.io/v1alpha1
      kind: Component
      metadata:
        name: k12-api-enrollment
        title: K12 API Enrollment
        description: Backend API for K12 MyPortal (.NET 8 Azure Functions)
        annotations:
          # When repo is accessible:
          # backstage.io/techdocs-ref: url:https://dev.azure.com/CFI-AzureDevOps/K12/_git/k12-api-enrollment
        tags:
          - dotnet
          - azure-functions
          - api
      spec:
        type: service
        lifecycle: production
        owner: group:cfi-backend-team
        system: k12-myportal
        providesApis:
          - enrollment-api
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Component
      metadata:
        name: k12-web-enrollment
        title: K12 Web Enrollment
        description: Frontend applications for K12 MyPortal (Angular 19 + Nx)
        tags:
          - angular
          - nx
          - frontend
      spec:
        type: website
        lifecycle: production
        owner: group:cfi-frontend-team
        system: k12-myportal
        consumesApis:
          - enrollment-api
      ---
      apiVersion: backstage.io/v1alpha1
      kind: Component
      metadata:
        name: k12-infra
        title: K12 Infrastructure
        description: Infrastructure as Code for K12 MyPortal (Terraform)
        tags:
          - terraform
          - azure
          - infrastructure
      spec:
        type: resource
        lifecycle: production
        owner: group:cfi-devops-team
        system: k12-myportal
      ```
    </content>
  </file>
</catalog_files>

<integration_steps>
  <step order="1">Create catalog files in wiki/ directory</step>
  <step order="2">Update app-config.yaml catalog locations</step>
  <step order="3">Add catalog-info.yaml to each external repository</step>
  <step order="4">Configure Azure DevOps integration for auto-discovery</step>
  <step order="5">Validate catalog in Backstage UI</step>
</integration_steps>

<output_format>
  When building catalog:
  1. Show catalog model diagram
  2. Provide all catalog-info.yaml files
  3. Update app-config.yaml locations
  4. Provide validation steps
  5. Note external repo requirements
</output_format>

<validation_checklist>
  - [ ] System entity created
  - [ ] Domain entity created
  - [ ] All components defined
  - [ ] Team/group entities created
  - [ ] Relationships properly linked
  - [ ] TechDocs annotations present
  - [ ] Catalog loads without errors
  - [ ] Search indexes all entities
</validation_checklist>
