# Email deliverability

Sign-in codes go out through Resend, from `noreply@icetrack.vip`.

## The DNS records this needs

Three were added when Resend was set up, and are in place:

| Record | Name | Purpose |
| --- | --- | --- |
| TXT | `resend._domainkey` | DKIM — signs each message |
| TXT | `send` | SPF — says Amazon SES may send for us |
| MX | `send` | Bounce handling |

**A fourth is missing, and it is the one corporate mail systems care about.**

## DMARC

Add this at the DNS provider (Vercel, under the domain's DNS records):

```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@icetrack.vip
```

`p=none` asks for no enforcement, only reporting — the right setting while a
domain is new. It can be tightened to `quarantine` and then `reject` once the
reports show nothing but legitimate mail.

## Why it matters

Microsoft 365 and Google Workspace treat a missing DMARC policy as a strong
negative signal and will often drop the message without a bounce. Consumer
Outlook and Gmail are more forgiving, which produces the symptom seen here:
codes arrive at personal addresses and vanish at work ones.

A new domain also has no sending reputation at all. Even with DMARC in place,
expect a few weeks of landing in spam while that builds. Marking those messages
as "not junk" speeds it up.

## Checking it

```bash
nslookup -type=TXT _dmarc.icetrack.vip 1.1.1.1
```

Or paste the domain into <https://www.mail-tester.com> and send it a test
sign-in code — it scores the whole setup and names what is missing.
