# Vettofit AI Gut Health Checkup -- Complete Setup Guide

This guide walks you through every step needed to add the Gut Health Checkup feature to your Shopify store (vettofit.com). No coding experience required -- just follow each step in order.

---

## 1. Overview

### What this feature does

The Gut Health Checkup is an interactive quiz on your Shopify store where pet parents answer questions about their dog's health, diet, and lifestyle. At the end, they receive a gut health score (0--100), personalized recommendations, and product suggestions. Behind the scenes their data is:

- Saved to a Google Sheet for easy viewing and export
- Sent to Klaviyo so you can trigger automated email flows (results emails, follow-ups, product recommendations)
- Added to Shopify as a customer record with tags and metafields so you can segment, retarget, and personalize

### Files included

| File | What it does | Where it goes |
|------|-------------|---------------|
| `assets/gut-checkup-styles.css` | Visual styling for the quiz | Shopify theme Assets folder |
| `assets/gut-checkup-app.js` | Quiz logic, scoring, and webhook submission | Shopify theme Assets folder |
| `templates/page.gut-checkup.liquid` | Shopify page template that loads the quiz | Shopify theme Templates folder |
| `snippets/gut-checkup-banner.liquid` | Homepage banner linking to the quiz | Shopify theme Snippets folder |
| `scripts/google-apps-script.gs` | Backend webhook (Google Sheets + Klaviyo + Shopify API) | Google Apps Script |
| `SETUP-GUIDE.md` | This guide | For your reference only (not uploaded anywhere) |

### Time estimate

About 30 minutes if you have all your accounts ready (Shopify, Google, Klaviyo, Meta).

---

## 2. Step 1: Upload Assets to Shopify

You need to upload two files into your Shopify theme so the quiz has its styling and logic.

1. Log in to your Shopify Admin at **https://vettofit.myshopify.com/admin**
2. Go to **Online Store** (left sidebar) then click **Themes**
3. Find your active/live theme and click the three-dot menu (**...**) next to **Customize**
4. Click **Edit code**
5. In the left sidebar, scroll down to the **Assets** folder
6. Click **Add a new asset**
7. Click **Upload file** and select `gut-checkup-styles.css` from the `assets/` folder on your computer
8. Click **Upload**
9. Repeat: click **Add a new asset** again
10. Upload `gut-checkup-app.js` from the `assets/` folder
11. Click **Upload**

You should now see both files listed under Assets:
- `gut-checkup-styles.css`
- `gut-checkup-app.js`

**Do not close the code editor yet** -- you will need it for the next two steps.

---

## 3. Step 2: Create the Page Template

This template tells Shopify how to render the Gut Health Checkup page.

1. You should still be in the theme code editor. In the left sidebar, scroll to the **Templates** folder.
2. Click **Add a new template**
3. In the dialog that appears:
   - For **template type**, select **page** from the dropdown
   - For **template name**, type `gut-checkup` (this creates a file called `page.gut-checkup.liquid`)
4. Click **Create template**
5. The editor will open the new file with some default content. **Select all the default content and delete it.**
6. Open the file `templates/page.gut-checkup.liquid` from the project folder on your computer (open it with any text editor like Notepad, TextEdit, or VS Code)
7. Copy the entire contents of that file
8. Paste it into the Shopify code editor (where you just deleted the default content)
9. Click **Save**

---

## 4. Step 3: Upload the Banner Snippet

1. Still in the code editor, scroll to the **Snippets** folder in the left sidebar
2. Click **Add a new snippet**
3. Name it `gut-checkup-banner` (Shopify will automatically add `.liquid`)
4. Open the file `snippets/gut-checkup-banner.liquid` from your computer
5. Copy the entire contents and paste into the Shopify editor
6. Click **Save**

You can now close the code editor.

---

## 5. Step 4: Create the Page in Shopify

Now you need to create the actual page that visitors will see.

1. In Shopify Admin, go to **Online Store** (left sidebar) then click **Pages**
2. Click **Add page** (top right)
3. Fill in the following:
   - **Title:** `Gut Health Checkup`
   - **Content:** Leave the body content area empty (the template handles everything)
4. In the **right sidebar**, look for **Theme template** (you may need to scroll down)
5. Click the dropdown and select **gut-checkup** (this is the template you created in Step 2)
6. Scroll down to **Search engine listing** and click **Edit website SEO**:
   - **Page title:** `Free AI Gut Health Checkup for Dogs | Vettofit`
   - **Meta description:** `Get your dog's personalized gut health score in 2 minutes. Answer simple questions about your pet's diet, digestion, and lifestyle -- receive a free assessment with expert recommendations.`
   - **URL handle:** `gut-health-checkup`
7. Make sure the **Visibility** is set to **Visible**
8. Click **Save**

### Test the page

Open your browser and go to: **https://vettofit.com/pages/gut-health-checkup**

You should see the quiz. It will not submit data to a backend yet (we will set that up next), but you can verify that the page loads correctly and the quiz steps work.

---

## 6. Step 5: Add to Navigation

Add the checkup to your store's menu so visitors can find it.

1. In Shopify Admin, go to **Online Store** then click **Navigation**
2. Click on your **Main menu** (or whichever menu you want to add it to)
3. Click **Add menu item**
4. Fill in:
   - **Name:** `Gut Health Checkup`
   - **Link:** Click the field, select **Pages**, then select **Gut Health Checkup**
5. Drag the menu item to position it where you want (for example, after "Shop" or before "Contact")
6. Click **Save menu**

Visit your store's homepage and verify the new menu item appears and links to the correct page.

---

## 7. Step 6: Add Homepage Banner

There are two ways to display the quiz banner on your homepage:

### Option A: Using the theme editor (Recommended -- no code needed)

1. In Shopify Admin, go to **Online Store** then click **Themes**
2. Click **Customize** on your active theme
3. From the page dropdown at the top, make sure you are editing the **Home page**
4. Click **Add section** (in the left sidebar)
5. Look for **Custom Liquid** (it may be under "Advanced" or "Other")
6. In the custom Liquid content field, paste this one line:

```
{% render 'gut-checkup-banner' %}
```

7. Use the drag handle to move the section to where you want it on the page (for example, below the hero image or above the featured products)
8. Click **Save**

### Option B: Editing the theme code directly

1. Go to **Online Store** then **Themes** then click the three-dot menu and **Edit code**
2. Find your homepage template or section file (often called `index.liquid`, `page.index.liquid`, or a JSON template under `templates/index.json`)
3. Add this line where you want the banner to appear:

```liquid
{% render 'gut-checkup-banner' %}
```

4. Click **Save**

---

## 8. Step 7: Set Up Google Sheets Backend

This is the "brain" that receives quiz data, stores it, and sends it to Klaviyo and Shopify.

### Create the Google Sheet

1. Go to **https://sheets.google.com** and sign in with your Google account
2. Click the **+** (Blank spreadsheet) to create a new sheet
3. Name it **Vettofit Gut Health Submissions** (click the title at the top left to rename)
4. Look at the URL in your browser. It will look like this:
   ```
   https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
   ```
   The part between `/d/` and `/edit` is your **Spreadsheet ID**. Copy it and save it -- you will need it shortly.

### Set up the Apps Script

1. With the spreadsheet open, click **Extensions** in the menu bar at the top
2. Click **Apps Script**
3. A new tab will open with the Apps Script editor
4. You will see a file called `Code.gs` with a default `myFunction()`. **Select all the content and delete it.**
5. Open the file `scripts/google-apps-script.gs` from the project folder on your computer
6. Copy the entire contents and paste into the Apps Script editor
7. Now replace the placeholder values at the top of the file:
   - Replace `%%YOUR_SPREADSHEET_ID%%` with the Spreadsheet ID you copied earlier
   - Leave `%%YOUR_KLAVIYO_PRIVATE_API_KEY%%` for now (we will fill it in during Step 8)
   - Leave `%%YOUR_STORE%%` and `%%YOUR_ADMIN_API_TOKEN%%` for now (Step 9)
8. Click the **floppy disk icon** or press **Ctrl+S** (Cmd+S on Mac) to save
9. Name the project **Vettofit Gut Health Backend** when prompted

### Deploy as a Web App

1. Click **Deploy** (top right) then **New deployment**
2. Click the **gear icon** next to "Select type" and choose **Web app**
3. Fill in:
   - **Description:** `Gut Health Checkup Webhook`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Google will ask you to authorize the script. Click **Authorize access**.
6. If you see a "This app isn't verified" warning:
   - Click **Advanced** (bottom left)
   - Click **Go to Vettofit Gut Health Backend (unsafe)**
   - Click **Allow**
7. You will see a **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
   **Copy this URL** -- this is your webhook endpoint.

### Update the quiz to use the webhook

1. Go back to Shopify Admin, then **Online Store** then **Themes** then **Edit code**
2. In the Assets folder, open `gut-checkup-app.js`
3. Find the line that contains `WEBHOOK_URL` (use Ctrl+F or Cmd+F to search)
4. Replace the placeholder URL with the Web App URL you just copied
5. Click **Save**

### Test the webhook

1. Go back to the Apps Script editor
2. In the function dropdown (next to the play button), select `testDoPost`
3. Click the **play button** (Run)
4. If prompted, authorize again
5. Check the **Execution log** at the bottom -- you should see success messages
6. Go back to your Google Sheet -- you should see a test row with sample data

---

## 9. Step 8: Set Up Klaviyo Integration

Klaviyo lets you send automated emails based on quiz results.

### Get your Klaviyo API key

1. Log in to **https://www.klaviyo.com** (create a free account if you do not have one)
2. Click the **gear icon** (Settings) in the bottom left
3. Click **API keys** (under Account)
4. You need a **Private API Key**. If you do not have one:
   - Click **Create Private API Key**
   - Name it `Gut Health Checkup`
   - Under permissions, enable **Full Access** for Profiles and Events (or grant Read/Write for both)
   - Click **Create**
5. Copy the private API key (it starts with `pk_`)

### Add the key to your script

1. Go back to the Apps Script editor (the tab should still be open, or go to your Google Sheet and click Extensions then Apps Script)
2. Find the line with `%%YOUR_KLAVIYO_PRIVATE_API_KEY%%`
3. Replace it with your actual Klaviyo private API key
4. Click **Save**
5. **Important:** After saving, you need to re-deploy. Click **Deploy** then **Manage deployments**
6. Click the **pencil icon** (edit) on your active deployment
7. Under **Version**, select **New version**
8. Click **Deploy**

### Create a Klaviyo Flow

A "flow" is an automated email sequence triggered when someone completes the quiz.

1. In Klaviyo, go to **Flows** (left sidebar)
2. Click **Create Flow**
3. Click **Build your own** (or start from scratch)
4. Name it: `Gut Health Checkup Results`
5. For the trigger:
   - Select **Metric** as the trigger type
   - Choose the metric **Gut Checkup Completed** (this will appear after your first test submission goes through; if you do not see it yet, type it in manually)
6. Build your email sequence. Here is a recommended structure:

**Email 1 -- Immediate (0 delay)**
- Subject: `{{person.pet_name}}'s Gut Health Results Are Ready`
- Include the gut score, flagged areas, and product recommendations
- Strong call-to-action to shop recommended products

**Email 2 -- 3 days later**
- Subject: `3 tips to improve {{person.pet_name}}'s gut health`
- Educational content about gut health
- Soft product recommendations

**Email 3 -- 7 days later**
- Subject: `A special offer for {{person.pet_name}}`
- Exclusive discount on recommended products
- Urgency/scarcity element

7. Turn the flow **Live** when ready

---

## 10. Step 9: Set Up Shopify Admin API Token

This allows the Google Apps Script to create and tag customers in your Shopify store.

1. In Shopify Admin, go to **Settings** (bottom left of the sidebar)
2. Click **Apps and sales channels**
3. Click **Develop apps** (at the top of the page)
4. If you see a message about enabling development, click **Allow custom app development** and confirm
5. Click **Create an app**
6. Name it: `Gut Health Checkup`
7. Click **Create app**
8. Click **Configure Admin API scopes**
9. Search for and enable these scopes:
   - `write_customers` -- check the box
   - `read_customers` -- check the box
10. Click **Save**
11. Click **Install app** (top right)
12. Confirm by clicking **Install**
13. You will see the **Admin API access token**. Click **Reveal token once**.
    **IMPORTANT: Copy this token immediately and save it somewhere safe. You can only see it once.**

### Add credentials to your script

1. Go back to the Apps Script editor
2. Find `%%YOUR_STORE%%` and replace it with `vettofit` (so the full value reads `vettofit.myshopify.com`)
3. Find `%%YOUR_ADMIN_API_TOKEN%%` and replace it with the access token you just copied
4. Click **Save**
5. Re-deploy: Click **Deploy** then **Manage deployments** then edit then select **New version** then **Deploy**

---

## 11. Step 10: Facebook Pixel Setup

The quiz automatically fires a custom event called `GutCheckupComplete` when someone finishes the quiz. This lets you build audiences and retarget quiz takers on Facebook and Instagram.

### Verify your Facebook Pixel is installed

1. Install the **Meta Pixel Helper** Chrome extension (search for it in the Chrome Web Store)
2. Visit your store (vettofit.com) and click the extension icon
3. You should see your Pixel ID listed as active
4. If the pixel is not installed, follow Meta's instructions for adding it to Shopify (Settings then Apps then Facebook & Instagram)

### Create a Custom Audience from quiz takers

1. Go to **Meta Ads Manager** (https://adsmanager.facebook.com)
2. Click the hamburger menu (three lines) then **Audiences**
3. Click **Create Audience** then **Custom Audience**
4. Select **Website** as the source
5. Set the criteria:
   - Event: Choose **GutCheckupComplete** from the dropdown
   - Retention: 180 days (or your preferred window)
6. Name the audience: `Gut Health Checkup Completers`
7. Click **Create Audience**

### Create a retargeting campaign

1. In Ads Manager, click **Create** to start a new campaign
2. Choose your objective (e.g., **Sales** or **Traffic**)
3. At the ad set level, under **Audience**, click **Custom Audiences**
4. Select the `Gut Health Checkup Completers` audience you just created
5. Create ad creative that references their quiz results, for example:
   - "You checked your dog's gut health -- now improve it with 15% off"
   - "Your dog's gut health matters. Get the supplements vets recommend."
6. Set your budget and schedule, then publish

### Create a Lookalike Audience (optional, recommended)

1. Go to **Audiences** then **Create Audience** then **Lookalike Audience**
2. Source: Select `Gut Health Checkup Completers`
3. Location: Select your target countries
4. Size: Start with 1% for best match quality
5. Click **Create Audience**
6. Use this audience for prospecting campaigns to find new customers similar to quiz takers

---

## 12. Step 11: Viewing and Exporting Data

### Google Sheets

Your data appears automatically in the Google Sheet you created.

- **Filter data:** Click the filter icon in the toolbar, or go to **Data** then **Create a filter**. You can then filter by any column (e.g., show only score-critical submissions).
- **Sort data:** Click any column header, then go to **Data** then **Sort sheet by column**.
- **Export data:** Go to **File** then **Download** and choose your format (Excel, CSV, PDF).
- **Share the sheet:** Click the **Share** button (top right) to give team members access.

### Shopify Admin

1. Go to **Customers** in Shopify Admin
2. Click **Filters** or type in the search bar
3. To find all quiz takers: Search for the tag `gut-checkup`
4. To find customers who need attention: Search for the tag `score-critical` or `vet-recommended`
5. To view a customer's metafields: Click on a customer, scroll down to the **Metafields** section. You will see their gut score, pet name, breed, flagged areas, and more.

### Klaviyo

1. Go to **Profiles** in Klaviyo to see all quiz takers
2. Click on any profile to see their properties (pet name, breed, gut score, etc.)
3. Go to **Flows** then click on your Gut Health Checkup flow to see analytics (open rates, click rates, revenue)
4. To create a segment: Go to **Lists & Segments** then **Create Segment**
   - Example: People who completed the checkup AND have a score below 40
   - Use these segments for targeted campaigns

### Exporting data from each platform

| Platform | How to export |
|----------|--------------|
| Google Sheets | File then Download then CSV or Excel |
| Shopify | Customers page then select customers then Export |
| Klaviyo | Profiles or Segments then Export to CSV |

---

## 13. Troubleshooting

### The quiz page shows a blank page or error

- Double-check that you selected the **gut-checkup** template in the page settings (Step 4, item 5)
- Verify both asset files (`gut-checkup-styles.css` and `gut-checkup-app.js`) were uploaded successfully
- Open your browser's developer console (right-click the page then Inspect then Console tab) and look for red error messages

### The quiz submits but no data appears in Google Sheets

- Verify the webhook URL in `gut-checkup-app.js` matches the deployed web app URL exactly
- In the Apps Script editor, go to **Executions** (left sidebar) to see if the function ran and if there were any errors
- Run the `testDoPost` function manually to confirm the script can write to the sheet
- Make sure the Google Sheet is not in a different Google account than the script

### Klaviyo is not receiving data

- Confirm your Klaviyo API key is correct (no extra spaces, starts with `pk_`)
- Check the Apps Script execution logs for Klaviyo-specific errors
- In Klaviyo, go to **Activity Feed** (under Analytics) to see if events are arriving
- Make sure you re-deployed after updating the API key (Step 8)

### Shopify customers are not being created/tagged

- Verify the Shopify access token has `write_customers` and `read_customers` scopes
- Make sure the store domain is correct (just the subdomain, e.g., `vettofit`, not the full URL)
- Check the Apps Script execution logs for Shopify-specific errors
- Note: Shopify access tokens cannot be viewed again after initial creation. If lost, you need to uninstall and reinstall the custom app.

### The Facebook Pixel event is not firing

- Make sure the Meta Pixel Helper extension shows your pixel as active on the quiz page
- Complete the quiz in its entirety (the event fires only upon completion)
- Check your browser console for JavaScript errors
- In Meta Events Manager, it can take up to 20 minutes for new events to appear

### "This app isn't verified" warning during Google authorization

This is normal for personal/custom Apps Scripts. Clicking **Advanced** then **Go to [project name] (unsafe)** is safe -- you wrote this code yourself.

### Webhook returns "error" status

- Open the Apps Script editor and go to **Executions** to see the detailed error message
- Common causes: expired API token, incorrect spreadsheet ID, API rate limits
- If you see "Cannot open spreadsheet," double-check the SPREADSHEET_ID constant

### How to test the full flow end-to-end

1. Open the quiz page on your store in an incognito/private browser window
2. Complete the quiz with a test email address
3. After submission, check:
   - Google Sheet: New row should appear within a few seconds
   - Klaviyo: Check Activity Feed for the "Gut Checkup Completed" event
   - Shopify: Search for the test email in Customers -- should appear with tags
4. Delete the test row from Google Sheets and the test customer from Shopify when done

---

## 14. Optional Enhancements

These are not required but can add value as you grow.

### Create a Shopify Metaobject for gut health submissions

Instead of storing data only on the customer record, you can create a standalone Metaobject definition to store individual submissions. This is useful if a customer takes the quiz more than once.

1. Go to Shopify Admin then **Settings** then **Custom data**
2. Click **Metaobjects** then **Add definition**
3. Name: `Gut Health Submission`
4. Add fields for each data point (score, pet name, breed, flagged areas, etc.)
5. This enables you to build custom sections in your theme that display submission history

### Create Shopify customer segments

1. Go to **Customers** then **Segments**
2. Create useful segments like:
   - `gut-checkup AND score-critical` -- High-priority leads who need immediate attention
   - `gut-checkup AND vet-recommended` -- Customers whose pets should see a vet
   - `gut-checkup AND high-sensitivity-breed` -- Owners of sensitive breeds
3. Use these segments for targeted email campaigns or discount offers

### Advanced Klaviyo flows

- **Re-engagement flow:** If someone started the quiz but did not finish (track a "Gut Checkup Started" event from the front-end), send a reminder email after 1 hour
- **Re-check flow:** 90 days after the initial checkup, email the customer suggesting they retake the quiz to track progress
- **Score-based flows:** Create separate flows for each score bracket with tailored product recommendations and content

### A/B testing

- Test different question orders to see which produces higher completion rates
- Test different result page designs (more detailed vs. simpler)
- Test different email subject lines in your Klaviyo flow
- Test the banner placement on the homepage (above fold vs. below fold)
- Use Google Optimize or Shopify's built-in A/B testing (if available on your plan) for page-level tests

---

## Quick Reference: All Placeholder Values to Replace

| Placeholder | Where | What to put |
|------------|-------|-------------|
| `%%YOUR_SPREADSHEET_ID%%` | google-apps-script.gs | Your Google Sheet ID (from the URL) |
| `%%YOUR_KLAVIYO_PRIVATE_API_KEY%%` | google-apps-script.gs | Klaviyo private API key (starts with `pk_`) |
| `%%YOUR_STORE%%` | google-apps-script.gs | `vettofit` (your Shopify subdomain) |
| `%%YOUR_ADMIN_API_TOKEN%%` | google-apps-script.gs | Shopify Admin API access token |
| `WEBHOOK_URL` | gut-checkup-app.js | Google Apps Script web app URL |

---

## Need Help?

If you get stuck on any step:

1. Re-read the step carefully -- most issues come from skipping a sub-step
2. Check the Troubleshooting section above
3. Look at the Apps Script execution logs for backend issues (Extensions then Apps Script then Executions)
4. For Shopify-specific questions, visit the Shopify Help Center at https://help.shopify.com
5. For Klaviyo questions, visit https://help.klaviyo.com
