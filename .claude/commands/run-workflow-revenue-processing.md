# Revenue Workflow Processing Skill

REQ-GA018-008: Revenue Workflow Skill Definition
BLP: [Alignment, Autonomy, Durability, Self-Organization]

Process revenue events through the GA018 Treasury System with TB workflow integration,
approval-gated operations, and WhatsApp notifications.

## Revenue Stream Classification

The workflow automatically classifies revenue into four streams:
- **InterCabal**: Daily comedy subscription payments
- **Chainlink**: Prediction market fees
- **Freelance**: Contract/consulting income
- **Agentic Products**: SaaS/API subscriptions

## Notification Thresholds

- **Immediate**: $500+ triggers immediate WhatsApp notification
- **Daily Summary**: $100-$500 included in daily summary
- **Silent**: <$100 processed silently with audit logging

## Usage

```bash
# Process a revenue event
cd /home/craigmbrown/Project/ETAC-System/integrations/treasury
python3 -c "
from tb_revenue_integration import TBRevenueIntegration
from revenue_workflow_connector import RevenueSource

integration = TBRevenueIntegration()

# Process revenue with automatic classification
result = integration.process_revenue_with_tb(
    amount=750.00,
    source=RevenueSource.WEB3,
    description='Agentic Products subscription payment',
    require_approval=True,
    notify=True
)

print(f'Event ID: {result[\"event_id\"]}')
print(f'Success: {result[\"success\"]}')
print(f'Notification: {result[\"notification_type\"]}')
"
```

## Revenue Sources

- `RevenueSource.PAYPAL` - PayPal payments
- `RevenueSource.LIGHTNING` - Bitcoin Lightning Network
- `RevenueSource.ECASH` - eCash/Cashu payments
- `RevenueSource.WEB3` - Web3/Crypto payments
- `RevenueSource.BANK_TRANSFER` - Traditional bank transfers
- `RevenueSource.MANUAL` - Manual entry

## Approval Thresholds

Each source has a different approval threshold:
- PayPal: $1,000+
- Lightning: $100+
- eCash: $500+
- Web3: $5,000+
- Bank Transfer: $2,000+
- Manual: $100+

## Integration Points

- **TB Workflow Executor**: Pending approvals stored in `/home/craigmbrown/Project/plan_operationalization/pending_approvals.json`
- **WhatsApp Notifications**: Immediate alerts for high-value transactions
- **Budget Monitor**: Real-time revenue tracking and stream health
- **AgentKit Wallet**: Web3 payment integration

## Quick Commands

### Get Daily Summary
```bash
cd /home/craigmbrown/Project/ETAC-System/integrations/treasury
python3 -c "
from tb_revenue_integration import TBRevenueIntegration
integration = TBRevenueIntegration()
summary = integration.get_daily_summary()
print(f'Events Today: {summary[\"events_count\"]}')
print(f'Total Today: \${summary[\"total_today\"]:.2f}')
print(f'Total MTD: \${summary[\"total_mtd\"]:.2f}')
print(f'Net Position: \${summary[\"net_position\"]:.2f}')
print(f'Health: {summary[\"overall_health\"]}')
"
```

### Get System Health
```bash
cd /home/craigmbrown/Project/ETAC-System/integrations/treasury
python3 -c "
from ga018_status_provider import GA018StatusProvider
provider = GA018StatusProvider()
summary = provider.get_summary_for_monitor()
print(f'Service: {summary[\"service\"]}')
print(f'Status: {summary[\"status\"]}')
print(f'Revenue MTD: \${summary[\"key_metrics\"][\"revenue_mtd\"]:.2f}')
print(f'Critical Alerts: {summary[\"critical_alerts\"]}')
"
```

### Check Pending Approvals
```bash
cd /home/craigmbrown/Project/ETAC-System/integrations/treasury
python3 -c "
from tb_revenue_integration import TBRevenueIntegration
integration = TBRevenueIntegration()
pending = integration.get_pending_revenue_approvals()
print(f'Pending Revenue Approvals: {len(pending)}')
for p in pending:
    print(f'  - {p[\"request_id\"]}: \${p[\"amount\"]:.2f} ({p[\"source\"]})')
"
```

## BLP Tags

- **Alignment**: Classifies revenue to correct streams
- **Autonomy**: Processes transactions independently within thresholds
- **Durability**: Persists state across restarts
- **Self-Organization**: Adapts notification routing based on amount

## Related Files

- `/home/craigmbrown/Project/ETAC-System/integrations/treasury/tb_revenue_integration.py`
- `/home/craigmbrown/Project/ETAC-System/integrations/treasury/revenue_workflow_connector.py`
- `/home/craigmbrown/Project/ETAC-System/integrations/treasury/budget_monitor.py`
- `/home/craigmbrown/Project/ETAC-System/integrations/treasury/ga018_status_provider.py`
