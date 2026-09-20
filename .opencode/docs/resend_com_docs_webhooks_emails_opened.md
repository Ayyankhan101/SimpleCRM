# email.opened - Resend

> Source: https://resend.com/docs/webhooks/emails/opened
> Cached: 2026-09-19T11:22:19.101Z

---

```
{
  "type": "email.opened",
  "created_at": "2026-02-22T23:41:12.126Z",
  "data": {
    "broadcast_id": "8b146471-e88e-4322-86af-016cd36fd216",
    "created_at": "2026-02-22T23:41:11.894Z",
    "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
    "message_id": "<111-222-333@email.example.com>",
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "Sending this example",
    "template_id": "43f68331-0622-4e15-8202-246a0388854b",
    "tags": {
      "category": "confirm_email"
    }
  }
}

```

[Learn](/docs/dashboard/domains/introduction)[Webhooks](/docs/webhooks/introduction)[Webhook events reference](/docs/webhooks/emails/bounced)# email.opened

Copy pageCopy pageReceived when an email is opened.

Copy pageCopy page```
{
  "type": "email.opened",
  "created_at": "2026-02-22T23:41:12.126Z",
  "data": {
    "broadcast_id": "8b146471-e88e-4322-86af-016cd36fd216",
    "created_at": "2026-02-22T23:41:11.894Z",
    "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
    "message_id": "<111-222-333@email.example.com>",
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "Sending this example",
    "template_id": "43f68331-0622-4e15-8202-246a0388854b",
    "tags": {
      "category": "confirm_email"
    }
  }
}

```

Event triggered whenever the **recipient opened the email**.
Open rates are not always accurate. Learn more about why open rates may not
be accurate.

```
{
  "type": "email.opened",
  "created_at": "2026-02-22T23:41:12.126Z",
  "data": {
    "broadcast_id": "8b146471-e88e-4322-86af-016cd36fd216",
    "created_at": "2026-02-22T23:41:11.894Z",
    "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
    "message_id": "<111-222-333@email.example.com>",
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "Sending this example",
    "template_id": "43f68331-0622-4e15-8202-246a0388854b",
    "tags": {
      "category": "confirm_email"
    }
  }
}

```

Was this page helpful?

YesNo[email.failedPrevious](/docs/webhooks/emails/failed)[email.receivedNext](/docs/webhooks/emails/received)⌘I[x](https://x.com/resend)[github](https://github.com/resend)[youtube](https://www.youtube.com/@resendlabs)[website](https://resend.com/)