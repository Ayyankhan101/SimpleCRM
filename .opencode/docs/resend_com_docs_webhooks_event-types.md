# Event Types - Resend

> Source: https://resend.com/docs/webhooks/event-types
> Cached: 2026-09-19T11:22:08.342Z

---

## On this page

- [Email Events](#email-events)
- [Domain Events](#domain-events)
- [Contact Events](#contact-events)
- [Suppression Events](#suppression-events)

[Learn](/docs/dashboard/domains/introduction)[Webhooks](/docs/webhooks/introduction)# Event Types

Copy pageCopy pageList of supported event types and their payload.

Copy pageCopy page## [​](#email-events)Email Events

[`email.bounced`](/docs/webhooks/emails/bounced)Occurs whenever the recipient’s mail server permanently rejected the
email.[`email.clicked`](/docs/webhooks/emails/clicked)Occurs whenever the **recipient clicks on an email link**.[`email.complained`](/docs/webhooks/emails/complained)Occurs whenever the email was successfully delivered, but the recipient
marked it as spam.[`email.delivered`](/docs/webhooks/emails/delivered)Occurs whenever Resend **successfully delivered the email** to the
recipient’s mail server.[`email.delivery_delayed`](/docs/webhooks/emails/delivery-delayed)Occurs whenever the email couldn’t be delivered due to a temporary
issue. Delivery delays can occur, for example, when the recipient’s
inbox is full, or when the receiving email server experiences a transient
issue.[`email.failed`](/docs/webhooks/emails/failed)Occurs whenever the **email failed to send due to an error**. This event
is triggered when there are issues such as invalid recipients, API key
problems, domain verification issues, email quota limits, or other sending
failures.[`email.opened`](/docs/webhooks/emails/opened)Occurs whenever the **recipient opened the email**.[`email.received`](/docs/webhooks/emails/received)Occurs whenever Resend **successfully receives an email**.[`email.scheduled`](/docs/webhooks/emails/scheduled)Occurs whenever the **email is scheduled to be sent**.[`email.sent`](/docs/webhooks/emails/sent)Occurs whenever the **API request was successful**. Resend will attempt to
deliver the message to the recipient’s mail server.[`email.suppressed`](/docs/webhooks/emails/suppressed)Occurs whenever the **email is suppressed** by Resend.
## [​](#domain-events)Domain Events

[`domain.created`](/docs/webhooks/domains/created)Occurs when a **domain was successfully created**.[`domain.updated`](/docs/webhooks/domains/updated)Occurs when a **domain was successfully updated**.[`domain.deleted`](/docs/webhooks/domains/deleted)Occurs when a **domain was successfully deleted**.
## [​](#contact-events)Contact Events

[`contact.created`](/docs/webhooks/contacts/created)Occurs whenever a **contact was successfully created**.Note: When importing multiple contacts using CSV, these events won’t be
triggered. [Contact support](https://resend.com/help) if you have any
questions.[`contact.updated`](/docs/webhooks/contacts/updated)Occurs whenever a **contact was successfully updated**.[`contact.deleted`](/docs/webhooks/contacts/deleted)Occurs whenever a **contact was successfully deleted**.
## [​](#suppression-events)Suppression Events

[`suppression.added`](/docs/webhooks/suppressions/added)Occurs whenever an **email address is added to your suppression list**,
automatically after a hard bounce or spam complaint, or manually through
the dashboard or API.[`suppression.removed`](/docs/webhooks/suppressions/removed)Occurs whenever an email address is removed from your suppression
list.Was this page helpful?

YesNo[Managing WebhooksPrevious](/docs/webhooks/introduction)[Retries and ReplaysNext](/docs/webhooks/retries-and-replays)⌘I[x](https://x.com/resend)[github](https://github.com/resend)[youtube](https://www.youtube.com/@resendlabs)[website](https://resend.com/)