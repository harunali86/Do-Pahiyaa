# Vercel Deployment Checklist (Do Pahiyaa)

To successfully deploy the project on Vercel, you need to add the following Environment Variables in your Vercel Project Settings.

### Mandatory Keys (Core Functionality)
| Key | Value Source | Purpose |
|-----|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project > Settings > API | Database Connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project > Settings > API | Client-side Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project > Settings > API | Admin/Backend operations |
| `APP_BASE_URL` | Your Vercel URL (e.g., `https://codex.vercel.app`) | Redirects & Links |

### Payments (Razorpay)
| Key | Value Source | Purpose |
|-----|--------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay Dashboard > Settings | Public Payment Key |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard > Settings | Backend Verification |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard > Webhooks | Securely handle paid status |

### Notifications (WhatsApp Cloud API)
| Key | Value Source | Purpose |
|-----|--------------|---------|
| `WHATSAPP_ACCESS_TOKEN` | Meta Developers > Dashboard | API Authentication |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Developers > Dashboard | Target Sender ID |

---

### Deployment Steps:
1. **GitHub Push**: `git push origin main`
2. **Vercel Import**: Import your repository into Vercel.
3. **Add Environment Variables**: Copy-paste the keys above.
4. **Deploy**: Build should pass automatically now that Middleware conflict is resolved.
