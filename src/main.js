function driveDemo() {}

/**
 * Demo of Gmail API
 */
function demoNumberOne() {
  GmailApp.sendEmail(
    "zanass@wix.com",
    "🍪 My daily haiku",
    "testing out <b>BOLD</b> tag",
    {
      htmlBody:
        "<img src='https://camo.githubusercontent.com/ddca8d058585fd59e7aac5039af8abf679deb8c97a4363a6b344561dcf9fa93b/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f76312e59326c6b505463354d4749334e6a45786358647462323034636a687261486b33633370324e47707062336c714f54526b65475676626d3434636e4a6863324d7862485a6d64535a6c634431324d563970626e526c636d35686246396e61575a66596e6c666157516d593351395a772f794a46657963524b32444234632f67697068792e676966' />",
    }
  );
}

function GPT(prompt) {
  const response = UrlFetchApp.fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + SECRETS.OPENAI_API_KEY,
      },
      payload: JSON.stringify({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
      }),
    }
  );

  Logger.log(response.getContentText());
}
