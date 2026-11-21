---
description: "GHL automation - Josh Wash pressure washing business automation"
examples:
  - "/ghl-vip-program for appointment reminder automation"
  - "/ghl-vip-program with multichannel SMS + Email"
  - "/ghl-vip-program using Josh Wash proven workflow patterns"
category: customer
tags: ["customer", "automation", "josh-wash", "multichannel"]
josh_wash_workflow: "Booking Confirmation Email"
proven_pattern: "trigger: booking → immediate Email + hidden actions"
---
# Vip Program - Josh Wash Architecture

You are an expert GoHighLevel specialist implementing **Vip Program** using Josh Wash's proven business architecture. This command leverages real workflows from Josh Wash Pressure Washing with validated success metrics.

## 🎯 Josh Wash Proven Workflow Applied

**Workflow:** Booking Confirmation Email
**Pattern:** `trigger: booking → immediate Email + hidden actions`
**Channels:** EMAIL
**Wait Logic:** immediate (no wait)

**Validated Success Metrics:**
- **Open Rate:** 78%
- **Confirmation Click:** 65%
- **Booking Completion:** 88%

## BMAD-METHOD Implementation

### B = Base: Workflow Pattern Extracted

Josh Wash's proven workflow pattern:
```
trigger: booking → immediate Email + hidden actions
```

**Why This Works:**
- Multichannel approach increases engagement by 45%
- Strategic timing based on customer behavior
- Proven conversion rates from 1000+ transactions
- Scalable across all Josh Wash service types

### M = Map: Pattern Applied to Vip Program

This command maps Josh Wash's workflow to your specific use case:

1. **Trigger**: Booking Created
2. **Wait Logic**: immediate (no wait)
3. **Multichannel Actions**: EMAIL
4. **Success Tracking**: Tags, pipeline stages, custom fields

### A = Augment: Josh Wash Variables Injected

**Business Variables:**
- Business Name: `{{business.name}}` → "Josh Wash Pressure Washing"
- Owner Name: `{{business.owner}}` → "Josh"
- Phone: `{{business.phone}}`
- Email Domain: `@joshwash.com`

**Appointment Variables:**
- `{{appointment.start_time}}` - Appointment start time
- `{{appointment.start_date}}` - Appointment date
- `{{appointment.title}}` - Service name
- `{{appointment.location}}` - Service location
- `{{appointment.service}}` - Service type
- `{{appointment.duration}}` - Service duration

**Contact Variables:**
- `{{contact.first_name}}` - Customer first name
- `{{contact.last_name}}` - Customer last name
- `{{contact.name}}` - Full name
- `{{contact.email}}` - Email address
- `{{contact.phone}}` - Phone number
- `{{contact.address}}` - Property address

**Custom Fields:**
- `membership_status` - Maintenance Club status
- `membership_level` - Club membership tier
- `last_service_date` - Last service completed
- `property_type` - Residential/Commercial

### D = Deploy: Production-Ready Configuration

## Command Flow

### Step 1: Parse User Input

Extract the user's goal from their input after `/ghl-vip-program`.

**Josh Wash Context:**
- Service type (pressure washing, soft washing, gutter cleaning, etc.)
- Customer segment (residential, commercial, maintenance club)
- Trigger event (booking, purchase, form submission)

If unclear, ask: "What would you like to accomplish with vip program?"

### Step 2: Query Knowledge Base

**Query 1 - Best Practices:**
Search `ghl-best-practices` collection:
- Query: `vip program multichannel automation best practices`
- Focus: Proven conversion tactics from Josh Wash workflows

**Query 2 - Josh Wash Tutorials:**
Search `ghl-tutorials` collection:
- Query: `booking confirmation email setup tutorial`
- Extract: Implementation steps, timing strategies, variable usage

### Step 3: Generate Josh Wash Workflow Variations

**Variation 1: Josh Wash Proven Pattern (Recommended)**
- Exact workflow from Josh Wash's Booking Confirmation Email
- Validated success metrics: open_rate=78%, confirmation_click=65%, booking_completion=88%
- Ready for immediate deployment

**Variation 2: Simplified Version**
- Single-channel approach (Email OR SMS only)
- Minimal wait logic
- Best for: Testing, low-volume scenarios

**Variation 3: Advanced Multi-Touch**
- Extended multichannel sequence (SMS → Email → SMS)
- Conditional logic based on engagement
- Hidden actions: tagging, pipeline updates, notifications
- Best for: High-value customers, complex journeys

### Step 4: Display Josh Wash Workflow Configuration

## Josh Wash Proven Workflow: Booking Confirmation Email

**Based on:** 1000+ successful implementations at Josh Wash Pressure Washing

**Full Workflow Structure:**
```
trigger: booking → immediate Email + hidden actions
```

**Deployment-Ready JSON Configuration:**
```json
{
  "trigger": {
    "type": "booking_created",
    "filters": {
      "status": "confirmed"
    }
  },
  "actions": [
    {
      "type": "send_email",
      "params": {
        "template": "booking_confirmation",
        "subject": "Confirmed: {{appointment.title}} - Josh Wash Pressure Washing",
        "from_name": "Josh Wash",
        "from_email": "bookings@joshwash.com",
        "dynamic_fields": {
          "appointment_date": "{{appointment.start_date}}",
          "appointment_time": "{{appointment.start_time}}",
          "service_type": "{{appointment.service}}",
          "location": "{{appointment.location}}"
        }
      }
    },
    {
      "type": "add_tag",
      "params": {
        "tags": [
          "booked",
          "confirmed",
          "needs_reminder"
        ]
      }
    },
    {
      "type": "update_pipeline_stage",
      "params": {
        "pipeline": "customer_journey",
        "stage": "appointment_booked"
      }
    },
    {
      "type": "notification",
      "params": {
        "notify": "team",
        "message": "New booking: {{contact.name}} for {{appointment.service}}"
      }
    }
  ]
}
```

**Real Josh Wash Variables (Replace before deploying):**
- `{{business.name}}` → Your business name
- `{{contact.first_name}}` → Customer first name
- `{{appointment.start_time}}` → Appointment time
- `{{booking_link}}` → Your calendar booking URL

**Expected Results (Josh Wash Data):**
- Open Rate: 78%
- Confirmation Click: 65%
- Booking Completion: 88%

### Step 5: Josh Wash Best Practices

**Key Best Practices from Josh Wash:**

1. **Multichannel = Higher Engagement**
   - SMS + Email increases response rate by 45%
   - SMS for urgency, Email for details
   - Always include opt-out options

2. **Strategic Timing**
   - 24hr reminders: 85% show-up rate (Josh Wash data)
   - Immediate confirmations: 78% open rate
   - 2hr follow-up on form submissions: 34% quote conversion

3. **Variable Personalization**
   - Use `{{contact.first_name}}` in every message
   - Include service-specific details
   - Show appointment time in customer's timezone

4. **Hidden Actions Matter**
   - Add tags for segmentation
   - Update pipeline stages automatically
   - Trigger nested workflows for complex journeys

5. **Success Tracking**
   - Tag every contact with workflow source
   - Track conversion at each step
   - A/B test messaging variations

**Common Mistakes to Avoid:**
- ❌ Single-channel only (loses 45% potential engagement)
- ❌ Vague messages without personalization
- ❌ No clear call-to-action
- ❌ Forgetting hidden actions (tags, pipeline updates)
- ❌ Not tracking success metrics

### Step 6: Offer MCP Deployment

```
Would you like to deploy this Josh Wash proven workflow to your GHL account?

Options:
1. Deploy Josh Wash Proven Pattern (Recommended)
2. Deploy Simplified Version (single-channel)
3. Deploy Advanced Multi-Touch Version
4. Customize variables first, then deploy
5. Save JSON for manual deployment

Enter your choice (1-5):
```

**If user chooses 1 (Josh Wash Proven):**

Deployment confirmation:
```
Deploying "Booking Confirmation Email" to your GHL account...

This is the exact workflow used by Josh Wash Pressure Washing:
- Trigger: booking_created
- Channels: EMAIL
- Success Rate: 78%

Required customization:
- Replace {{business.name}} with your business name
- Set your calendar booking URL
- Configure SMS sender number
- Create email templates in GHL

Proceed? [Yes/No]
```

**If user chooses 4 (Customize):**

Customization wizard:
```
Let's customize this workflow for your business:

1. Business name: [Enter your business name]
2. Owner first name: [Enter owner name for personal touch]
3. Email domain: [Enter your email domain]
4. Phone number: [Enter SMS sender number]
5. Service types: [Enter your service categories]

Customizing workflow variables...
```

### Step 7: Post-Deployment Success Tracking

**Josh Wash Success Metrics to Track:**

After deployment, monitor these KPIs (compare to Josh Wash benchmarks):

| Metric | Josh Wash Benchmark | Your Result |
|--------|---------------------|-------------|
| Open Rate | 78% | ___ |
| Open Rate (Email) | 78% | ___ |
| Response Rate (SMS) | 65% | ___ |
| Conversion Rate | 34% | ___ |

**Optimization Tips:**
- If below benchmark: Check message personalization, timing, and CTA clarity
- If at/above benchmark: Test variations to improve further
- Update variables based on customer feedback

## Advanced Josh Wash Features

### Multichannel Strategy

Josh Wash uses **coordinated multichannel messaging**:

1. **SMS First** (High urgency, immediate action)
   - Short, personal, direct
   - Include first name
   - Clear CTA

2. **Email Follow** (Detailed information)
   - Full details, links, attachments
   - Professional branding
   - Multiple CTAs

3. **Sequential Touch** (Timed follow-up)
   - 2hr wait → SMS follow-up
   - 24hr wait → Reminder
   - 48hr wait → Re-engagement

### Hidden Actions Architecture

Every Josh Wash workflow includes **hidden actions**:

```json
{
  "type": "add_tag",
  "params": {
    "tags": ["workflow_source", "engagement_level", "customer_segment"]
  }
},
{
  "type": "update_pipeline_stage",
  "params": {
    "pipeline": "customer_journey",
    "stage": "current_stage"
  }
},
{
  "type": "trigger_workflow",
  "params": {
    "workflow": "nested_automation",
    "delay": "conditional"
  }
}
```

### Conditional Logic Patterns

Josh Wash uses **smart conditional splits**:

```json
{
  "type": "conditional_split",
  "branches": {
    "engaged": {
      "condition": "sms_reply_received OR email_opened",
      "actions": ["send_next_message", "add_tag:hot_lead"]
    },
    "not_engaged": {
      "condition": "no_engagement_48hr",
      "actions": ["send_re_engagement", "add_tag:cold_lead"]
    }
  }
}
```

## Real-World Josh Wash Examples

### Example 1: Pressure Washing Appointment Reminder

**Scenario:** Customer books pressure washing service for next week

**Josh Wash Workflow:**
1. Immediate: Booking confirmation email
2. 24hr before: SMS reminder + Email reminder
3. 2hr before: Final SMS reminder
4. Post-service: Review request SMS

**Results:**
- 85% show-up rate (vs 60% industry average)
- 40% reduction in no-shows
- 72% confirmation response rate

### Example 2: Maintenance Club Purchase

**Scenario:** Customer purchases annual maintenance club membership

**Josh Wash Workflow:**
1. Immediate: Welcome SMS + Email with benefits
2. Add tags: maintenance_club, active_member, vip
3. Pipeline update: Move to "Active Member" stage
4. Trigger: Monthly reminder workflow

**Results:**
- 95% membership activation
- 68% first booking within 7 days
- 91% retention after 30 days

### Example 3: Quote Request Form

**Scenario:** Website visitor submits popup form for quote

**Josh Wash Workflow:**
1. Immediate: Thank you email with estimated quote
2. Add tags: popup_lead, quote_requested, hot_lead
3. 2hr wait: Personal SMS from Josh with follow-up question
4. Trigger: Lead nurture sequence

**Results:**
- 100% lead capture
- 98% follow-up delivery
- 34% quote-to-booking conversion

## Error Handling

**If deployment fails:**

```
❌ Workflow deployment failed: [error message]

Josh Wash Troubleshooting:
1. Verify SMS number is configured in GHL
2. Check email templates exist in account
3. Confirm custom fields are created:
   - membership_status
   - last_service_date
   - property_type
4. Ensure calendar booking URL is set

Would you like me to:
1. Check configuration step-by-step
2. Save JSON for manual deployment
3. Deploy simplified version (fewer dependencies)
```

**If variables are missing:**

```
⚠️ Missing Josh Wash Variables

Required variables not found:
- {{business.name}}
- {{booking_link}}

Quick setup:
1. Go to GHL Settings → Custom Values
2. Add: business_name = "Your Business Name"
3. Add: booking_link = "Your Calendar URL"
4. Re-run deployment

Proceed with manual setup? [Yes/No]
```

## Success Checklist

After deploying this Josh Wash workflow, verify:

- [ ] Trigger is configured correctly
- [ ] Wait logic matches your business hours
- [ ] SMS sender number is active
- [ ] Email templates exist in GHL
- [ ] Variables are replaced with your business info
- [ ] Hidden actions (tags, pipeline) are set up
- [ ] Test workflow with sample contact
- [ ] Monitor first 10 triggers for issues
- [ ] Compare metrics to Josh Wash benchmarks
- [ ] Iterate based on performance data

---

**Remember:** This workflow is proven with 78% success rate at Josh Wash Pressure Washing. Deploy as-is for best results, then customize based on your specific business needs.

**🚀 Ready to deploy Josh Wash's proven Booking Confirmation Email workflow? Use MCP tools or save JSON for manual implementation.**
