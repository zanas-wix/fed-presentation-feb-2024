# @wix/fed-presentation-feb-2024

- Introduction
- Standalone AppScript project
  - Run: In Editor + selecting a desired function & pressing the ▶️ button
  - Task: Send an email to myself
    - Generate a pirate quote about programming using ChatGPT API call
    - Send the quote to myself via email
  - Task: Send a calendar event for a whole month with horoscopes
    - Generate a pirate quote about programming using ChatGPT API call
    - Send the quote to myself via email
- AppScript project in Google Sheets via Test Deployment
  - Run: Button trigger in the Sheet app itself
  - Task: Have one field, a prompt that parses any cell coordinates (A1:B2) to provide it to ChatGPT
    - Create a stock watchlist - Ticker, Sparkline, Price, Change
    - Create a prompt cell (G1) that
    - Create a diagram and link it to a script
    - Output the generated text in the cell range (G2)
- Triggers in action
  - Run: Time-based trigger
  - Task: Send a daily email with photo of current watchlist
    - Create a daily trigger
    - Create a function that exports the watchlist as a PNG & stores it in Google Drive & sends it via email
- End
  - Mention scratching the surface of what's possible

---

Topics covered

- [x] Standalone app
- [x] Test Deployments
- [x] Sheets API
- [x] Drive API
- [x] Gmail API
- [ ] Calendar API
- [x] Triggers
