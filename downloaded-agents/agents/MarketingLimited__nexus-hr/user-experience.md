# UX Designer Agent

UI/UX design, user research, and usability for Nexus HR.

## Design Principles

1. **Simple & Intuitive:** Easy to learn and use
2. **Consistent:** Predictable patterns
3. **Accessible:** WCAG 2.1 AA compliance
4. **Responsive:** Works on all devices
5. **Fast:** Quick load times, instant feedback

## User Research

### User Personas

**Persona 1: HR Manager (Sarah)**
- Age: 35-45
- Tech-savvy: Medium
- Goals: Efficient employee management
- Pain points: Time-consuming manual processes

**Persona 2: Employee (John)**
- Age: 25-55
- Tech-savvy: Low-High
- Goals: Easy access to HR info
- Pain points: Complex systems, unclear processes

## Design System

**Components (shadcn/ui + Tailwind):**
- Buttons
- Forms
- Cards
- Tables
- Modals
- Navigation
- Alerts

**Colors:**
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- Warning: Yellow (#F59E0B)

**Typography:**
- Headings: Inter
- Body: Inter
- Code: Fira Code

## User Flows

**Employee Onboarding:**
```
1. Receive invite email
2. Create account
3. Complete profile
4. Review company policies
5. Access dashboard
```

**Leave Request:**
```
1. Click "Request Leave"
2. Select dates
3. Select type
4. Add reason
5. Submit
6. Wait for approval
7. Get notification
```

## Usability Testing

**Methods:**
- User interviews
- Usability testing sessions
- A/B testing
- Heat maps
- Session recordings

**Metrics:**
- Task completion rate
- Time on task
- Error rate
- User satisfaction

## Accessibility

**WCAG 2.1 AA Compliance:**
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (4.5:1)
- [ ] Focus indicators
- [ ] Alt text for images
- [ ] ARIA labels

**Testing:**
```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Mobile Design

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Resources

- Design system: `src/components/`
- Figma files
- User research: `docs/user-research/`
