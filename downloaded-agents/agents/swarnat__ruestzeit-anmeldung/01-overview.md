# Project Overview

## Introduction

This project is a Symfony platform for creating and managing **Ruestzeit** events. It combines a public registration flow with an administrative backend for planning, communication, and participant operations.

## Ruestzeit

**Ruestzeit** is the core event model. It contains event identity, registration settings, visibility toggles, ownership, and links to related data like participants, location, categories, custom fields, and mails.

## Anmeldung

**Anmeldung** represents a participant registration. It stores personal/contact data, status and payment fields, consent flags, meal and room preferences, optional extras, and event-specific custom answers.

## Admin

**Admin** is the backend user model. It handles authentication, roles, and ownership of event data such as Ruestzeiten, locations, and categories.

## Location

**Location** stores reusable venue data (title and address). A location can be assigned to multiple events to avoid duplicated setup.

## Category

**Category** enables participant tagging and visual grouping. It supports filtering, segmentation, and operational labeling in the admin interface.

## CustomField and CustomFieldAnswer

**CustomField** defines dynamic event-specific questions, including optional description/help text, a full-width layout toggle for frontend rendering, numeric sequence-based ordering, and optional CSS classes for checkbox/radio option label elements. It also supports a read-only text type that displays only label and description in the public form without creating an input or answer payload. **CustomFieldAnswer** stores participant responses to answerable custom field types, allowing flexible form extension without schema changes.

## LanguageOverwrite

**LanguageOverwrite** provides event-level term overrides. This allows wording customization per event without changing global translations.

## Config

**Config** is a global key-value store for runtime settings and platform-wide configuration values.

## PasswordReset

**PasswordReset** manages token-based password recovery with metadata for secure reset flows.

## UserColumnConfig

**UserColumnConfig** stores per-user, per-event table column preferences to optimize backend workflows.

## RuestzeitShareInvitation

**RuestzeitShareInvitation** supports tokenized event sharing by email, enabling controlled collaboration.

## Mail, MailAttachment, MailAttachmentClick

These models implement event communication. They track sent mails, attached files, and attachment click/open behavior.

## Protocol

**Protocol** stores request and context data for auditability, troubleshooting, and operational traceability.

## Landkreis

**Landkreis** provides structured regional reference data for consistent classification and filtering.

## Security Features

The system includes authenticated admin access, role-based permissions, password reset support, and maintenance-mode controls.

## Admin Features

The backend includes CRUD management, participant import, category assignment, mailing tools, statistics, signatures, sharing, and settings.

## Export Features

Export services provide CSV, Excel, and signature list outputs for reporting and offline processing.

## Media and File Features

The platform supports flyers/images and cloud-backed file handling for event assets and mail attachments.

## Localization Features

Localization combines standard translations with dynamic event-level overrides for context-specific wording.

## Public Registration Features

The frontend registration form supports configurable fields, enums, optional questions, and visibility toggles per event.

## Automation and Services

Utility services support code generation, example event creation, mail processing, and postal code handling.

## Quality and Deployment

The project includes database migrations, automated tests, Docker setup, and production-ready Symfony configuration.

## Architecture Summary

Overall, the application follows a structured Symfony + Doctrine architecture with clear domain models, configurable workflows, and strong operational tooling.

## Documentation Maintenance Rule

If any model, workflow, feature, or architecture-related behavior changes, this overview must be updated in the same change to keep it accurate and trustworthy.
