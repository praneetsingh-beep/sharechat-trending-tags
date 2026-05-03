# Deployment Handoff — Praneet's Run-Through

Everything below is **your** action items. Each block shows the exact commands. ETA: 25–30 min total.

---

## Step 1 — Create the GitHub repo (3 min)

1. Go to https://github.com/new
2. Repo name: `sharechat-trending-tags`
3. Visibility: **Public**
4. **Do NOT** initialize with README, .gitignore, or license (the repo must be empty)
5. Click **Create repository**
6. Copy the repo URL — looks like `https://github.com/YOURUSERNAME/sharechat-trending-tags.git`

---

## Step 2 — Push the code (5 min)

Open Terminal on your Mac, then run these in order. Replace `YOURUSERNAME` with your actual GitHub handle.

```bash
cd "/Users/praneetsingh/Desktop/Claude-Workspace/Projects/Personal/sharechat-trending-tags"

# init local repo
git init
git add .
git commit -m "Initial commit: ShareChat trending tags system + mobile prototype"

# connect to GitHub
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/sharechat-trending-tags.git
git push -u origin main
```

**If git asks for username/password:** GitHub now requires a Personal Access Token instead of password. If prompted:
- Username: your GitHub handle
- Password: paste a token from https://github.com/settings/tokens (classic, with `repo` scope)
- Or just use SSH: `git remote set-url origin git@github.com:YOURUSERNAME/sharechat-trending-tags.git`

Verify the push worked: open `https://github.com/YOURUSERNAME/sharechat-trending-tags` in a browser — you should see all the files.

---

## Step 3 — Grab API keys (10 min)

Open these in 3 tabs:

### A. Anthropic API key — required for Hindi quality (5 min, ~$1 credit needed)

1. Go to https://console.anthropic.com/settings/keys
2. If first time: sign in, add $5 credit at https://console.anthropic.com/settings/billing
3. Click **Create Key** → name it "ShareChat Trends" → copy the `sk-ant-...` value

### B. NewsAPI key — for India headlines (2 min, free)

1. Go to https://newsapi.org/register
2. Sign up with email
3. Copy the API key shown on the dashboard

### C. SerpAPI key — optional, for Google Trends realtime (2 min, free tier 100/mo)

1. Go to https://serpapi.com/users/sign_up
2. Sign up
3. Copy API key from https://serpapi.com/manage-api-key

**Note**: SerpAPI is optional — without it, the system uses the free Google Trends RSS, which works but is slightly less granular. Skip if you're tight on time.

---

## Step 4 — Deploy to Vercel (5 min)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. If first time, sign in with GitHub and grant Vercel access
4. Find `sharechat-trending-tags` → click **Import**
5. **Framework Preset** is auto-detected as Next.js — leave defaults
6. **Environment Variables** — add these before clicking Deploy:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` (your key from Step 3A) |
   | `NEWSAPI_KEY` | (your key from Step 3B) |
   | `SERPAPI_KEY` | (your key from Step 3C, optional) |
   | `CRON_SECRET` | any random string e.g. `praneet-shrechat-2026` |

7. Click **Deploy**
8. Wait ~2 min for build to complete
9. Click **Continue to Dashboard** → grab the **production URL** (`https://sharechat-trending-tags-XXX.vercel.app`)

---

## Step 5 — Smoke test (3 min)

1. Open the production URL **on your phone** (or in Chrome desktop with device toolbar set to iPhone 15 Pro)
2. Verify:
   - [ ] You see the gradient story-cards rail at the top
   - [ ] At least 10 trending tags are shown
   - [ ] Hindi text renders correctly (Devanagari script, not boxes)
   - [ ] Tapping a card opens the detail view
   - [ ] Detail view shows: heat score, "क्यों ट्रेंड कर रहा है", AI summary, related news, signal bars
   - [ ] Tapping "वापस" returns to the home rail

3. Force a fresh data refresh by visiting:
   `https://YOUR-URL.vercel.app/api/refresh?secret=praneet-shrechat-2026`
   You should see a JSON response like `{"ok":true,"tagCount":12,...}`

4. Check the JSON output:
   `https://YOUR-URL.vercel.app/api/trends`

---

## Step 6 — Take the screenshot (1 min)

In Chrome DevTools mobile view (iPhone 15 Pro / 393 × 852):

1. Open your Vercel URL
2. Cmd+Shift+P → "Capture screenshot" (or "Capture full size screenshot")
3. Save as `screenshot.png`

(There's also a static SVG mock at `public/screenshot.svg` in the repo as a backup.)

---

## Step 7 — Record the Loom (10 min, including 1-2 retakes)

1. Open `LOOM_SCRIPT.md` — read it through once
2. Open https://www.loom.com → install Loom for desktop if you haven't
3. Set up: Chrome with the production URL on iPhone 15 Pro mobile-view, GitHub README in tab 2 scrolled to the Mermaid diagram
4. Loom: **Screen + Voice** mode (no camera). Click record.
5. Follow the script — talk over the demo, don't read from screen
6. Stop after ~2 min
7. Loom auto-uploads → click **Share** → copy the shareable URL

---

## Step 8 — Submit (2 min)

The assignment expects four URLs/items:

1. **Hosted prototype URL**: your Vercel URL from Step 4
2. **GitHub repo URL**: from Step 1
3. **Loom video URL**: from Step 7
4. **Screenshot**: PNG file from Step 6 (or attach `public/screenshot.svg` from the repo)

Email/upload to whatever channel ShareChat specified.

---

## Troubleshooting

**Vercel build fails with "Module not found":**
Run `git add . && git commit -m "fix" && git push` again — sometimes the lock file or `node_modules` cache out of sync.

**Hindi text shows as boxes:**
Means the Noto Sans Devanagari font didn't load. Check the network tab in DevTools — Google Fonts must not be blocked. The font is loaded via @import in `app/globals.css`.

**"No trends shown" on prototype:**
- Check Vercel function logs (Vercel dashboard → your project → Logs tab)
- Most common cause: missing `ANTHROPIC_API_KEY` and ALL live sources rate-limiting at once, falling back to fixtures (which still gives you 10 valid tags — just curated, not live)
- Hit `/api/refresh?secret=...` to force a rebuild

**Cron not firing:**
Vercel cron only runs on Pro plan or higher. On the free Hobby plan, the prototype still refreshes on-demand when `/api/trends` is hit and cache is stale (>30 min), so the user-facing freshness is preserved. Mention this in the README's "what's next" section if asked — swap to upstash/cron-job.org for free always-on cron.

**"npm not found" / "node not found":**
Install Node.js 22 from https://nodejs.org. Confirm with `node --version` before running git commands.

---

## Final checklist before hitting submit

- [ ] Vercel URL loads in mobile view, shows ≥10 Hindi tags
- [ ] Tapping a tag opens the detail view, all sections render
- [ ] GitHub repo is **public** (check by opening the URL in incognito)
- [ ] README on GitHub renders the Mermaid diagram (GitHub renders Mermaid natively in markdown)
- [ ] Loom is set to **public link sharing** (not "internal only")
- [ ] All four submission items are pasted into the response

You got this. 💪
