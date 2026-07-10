## Screens in App

- Admin role screens:
  - Login screen: Authentication form with username/password fields, role selection (admin), error handling for invalid credentials
  - Dashboard screen: Overview of all water meters with real-time data charts, historical trends charts, summary statistics, quick access to alerts and billing off all meters
  - Meter management screen: List of all water meters, add/edit/remove meters, configure meter settings (thresholds, alerts), assign meters to users
  - Alerts screen: List of active alerts with details (type, message, timestamp), ability to acknowledge or resolve alerts, filter by meter or date
  - Billing screen: Monthly billing calculations based on water usage, view reports, export to PDF or Excel formats, send bills to users
  - User notification screen: Interface to send notifications to users about alerts, billing, or maintenance, history of sent notifications

- User role screens:
  - Login screen: Authentication form with username/password fields, auto-login option, auto , error handling for invalid credentials
  - Meter data screen: Display current water meter reading, usage statistics, last updated timestamp, auto-refresh every 5 minutes
  - Charts/history screen: Historical usage charts over time periods (daily, weekly, monthly), comparison with previous periods, export options
  - Alerts screen: Personal alerts related to meter (high usage, leaks), notification history, mark as read
  - Outdoor temperature screen: Display current outdoor temperature from DHT22 sensor, temperature history chart, weather-related alerts
  - Chat support screen: Real-time chat interface for user support, connect to API or AI endpoint, message history, file attachments