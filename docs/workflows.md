# Workflows

## Incoming customer request

Trigger:
- Phone call
- Email
- Website form
- Existing customer request

Steps:
1. Search for existing customer
2. Create customer if missing
3. Add site/address
4. Capture problem description
5. Capture contact details
6. Set priority
7. Decide next step:
   - Create work order directly
   - Book site visit
   - Create quote request
   - Put on hold

## Work order lifecycle

Statuses:
- new
- scheduled
- assigned
- on_the_way
- in_progress
- waiting_for_material
- waiting_for_customer
- completed
- ready_for_invoice
- invoiced
- cancelled

Swedish labels:
- Ny
- Bokad
- Tilldelad
- På väg
- Pågående
- Väntar material
- Väntar kund
- Klar
- Klar för fakturering
- Fakturerad
- Avbruten

## Electrician field workflow

The electrician should be able to:

1. Open "Mina jobb"
2. See today's assigned jobs
3. Open a work order
4. Call customer
5. Open navigation to address
6. Read job description
7. Change status
8. Start/report time
9. Add material
10. Add note
11. Upload/take photo
12. Mark job as completed

This flow must be mobile-first.

## Invoice draft workflow

When work order is completed:

1. Admin/manager reviews reported time
2. Admin/manager reviews material
3. Missing data is flagged
4. Invoice text is generated manually or semi-automatically
5. Invoice draft is saved
6. Later integration to Fortnox/Visma can be added

MVP does not send real invoices.
