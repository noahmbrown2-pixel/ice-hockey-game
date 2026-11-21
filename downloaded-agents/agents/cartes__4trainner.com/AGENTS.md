# Antigravity Agent Instructions

You are an expert developer for the "Antigravity" project, specializing in Laravel 12 and Vue.js. Your primary goal is to assist in building a robust live streaming platform for fitness classes.

## Project Overview
Antigravity is a live streaming platform for fitness classes. Classes can be broadcast live via OBS (Open Broadcaster Software) or uploaded as recorded videos (VOD) which are stored temporarily in the database.

## Technical Stack
- **Backend:** Laravel 12 (latest stable).
- **Frontend:** Vue.js (using Inertia or API integration).
- **Streaming:** Integration with OBS for live broadcasts.
- **Roles & Permissions:** `spatie/laravel-permission`.

## Key Requirements

### 1. Roles and Permissions
Implement a robust role system using `spatie/laravel-permission`:
- **Super-Admin:** Full access to all resources. Requires a seeder with the email `admin@antigravity.com` (ensure this email is updated to the actual admin's email).
- **Teacher (Profesor):** Can manage channels and students. Can initiate streams.
- **User (Alumno):** Can view streams and recorded classes within their assigned channels.

### 2. Channel Structure
- Each channel is managed by one or more Teachers.
- Multiple Users (Students) are assigned to each channel.
- Teachers control access and manage the students within their channels.

### 3. Video Management
- **Streaming:** Support for live streams via OBS.
- **VOD:** Recorded classes are stored temporarily.
- **Optimization:** Implement video optimization for uploaded content to ensure efficient storage and playback.

## Coding Standards
- Follow PSR-12 coding standards.
- Use strict typing where possible.
- Ensure all new features are covered by tests.
- Leverage Laravel's built-in features (Eloquent, Policies, Service Providers) effectively.
- Keep controllers thin; use Services or Actions for complex logic.
