# JYS platform gateway

Canonical application entry point: `https://app.jysenglish.com/`

This repository owns navigation only. It does not duplicate application logic.

| User surface | Canonical route | Application owner |
| --- | --- | --- |
| Student Study Hub | `https://app.jysenglish.com/study/` | [`Share1352/jys-study-hub`](https://github.com/Share1352/jys-study-hub) |
| Teacher Dashboard | `https://app.jysenglish.com/teacher/` | [`Share1352/jys-writing-trainer-static`](https://github.com/Share1352/jys-writing-trainer-static) |
| Public website and legacy routes | `https://www.jysenglish.com/` | [`Share1352/jysenglish-main-site-full`](https://github.com/Share1352/jysenglish-main-site-full) |
| Staff and HR operations | `https://www.jysenglish.com/hr` | [`Share1352/jys-hr-management`](https://github.com/Share1352/jys-hr-management) |

## Why this gateway exists

- The deployed Wix Custom Embed snapshot can remain older than the repository source.
- Both applications already work from GitHub Pages and deliberately share the
  `share1352.github.io` storage origin for student sign-in.
- Putting a custom domain on either application would split that shared storage.
- Putting a custom domain on the `Share1352.github.io` user site would also rebase
  unrelated project sites.
- This dedicated project-site domain keeps application hosting stable while users
  see one JYS-owned address.

The wrappers embed the real application pages. The applications keep the same
storage origin; the gateway owns only the friendly route and navigation.

## Email ownership

Email is three separate systems. Do not treat them as one queue:

1. Wix Email Marketing owns newsletters and campaigns.
2. The Study Hub / Writing backend uses Google Apps Script `MailApp` for product
   notifications.
3. The HR backend uses its own Google Apps Script `MailApp` controls and quota.

## Deployment

GitHub Pages publishes `main` from `/`. The `CNAME` file binds the project site
to `app.jysenglish.com`; Wix DNS must contain a CNAME from that host to
`share1352.github.io`.

Run `npm test` before publishing. Then verify `/`, `/study/`, and `/teacher/` over
HTTPS. Never move the custom domain to an application repository without first
accounting for shared browser storage.
