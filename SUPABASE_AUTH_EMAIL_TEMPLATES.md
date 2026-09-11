# Supabase Auth email templates required by Stage 2

The application uses server-side cookie sessions. Configure the Supabase Auth email templates so invite and recovery links pass a token hash to `/auth/confirm`.

## Supabase URL Configuration

Set **Site URL** to your application URL, for example `http://localhost:3000` locally and your HTTPS domain in production.

Allow the application URL(s) in **Redirect URLs**.

## Invite user template

In **Authentication → Email Templates → Invite user**, make the action link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/reset-password">
  Accept invitation and set password
</a>
```

## Reset password / Recovery template

In **Authentication → Email Templates → Reset Password**, make the action link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
  Reset password
</a>
```

The server route verifies the token using `verifyOtp`, stores the authenticated session in cookies, removes the token from the URL, and redirects to the reset-password page.
