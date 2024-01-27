/**
 * Demo of Gmail API
 */
function demoNumberOne() {
  const haiku = ChatGPT(`
    Generate a haiku about programming.
    Today is: ${new Date().toString()}
  `);

  const recipient = "zanass@wix.com";
  const subject = "⭐ My daily haiku";
  const htmlBody = `
    <pre>${haiku}</pre> ${SECRETS.IMAGE}
  `;

  Logger.log(
    XmlService.parse(htmlBody)
      .getAllContent()
      .map((n) => n.asText().getText())
      .join("")
  );

  GmailApp.sendEmail(recipient, subject, haiku, {
    htmlBody,
  });
}

function demoNumberTwo() {}

/**
 * Calls the OpenAI API to get a completion for the provided prompt.
 * @param {string} prompt - The prompt for the completion.
 */
function ChatGPT(prompt) {
  const httpResponse = UrlFetchApp.fetch(
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
  /** @type {ChatCompletion} */
  const response = JSON.parse(httpResponse.getContentText());
  const content = response.choices[0].message.content;

  Logger.log(`ChatGPT: ${content}`);

  return content;
}

/**
 * @typedef {Object} ChatCompletion
 * @property {string} id - The ID of the chat completion.
 * @property {string} object - The object type of the chat completion.
 * @property {number} created - The timestamp of when the chat completion was created.
 * @property {string} model - The model used for the chat completion.
 * @property {Array<ChatCompletionChoice>} choices - The choices made during the chat completion.
 * @property {ChatCompletionUsage} usage - The usage statistics of the chat completion.
 * @property {string} system_fingerprint - The system fingerprint of the chat completion.
 */

/**
 * @typedef {Object} ChatCompletionChoice
 * @property {number} index - The index of the choice.
 * @property {Object} message - The message of the choice.
 * @property {'assistant' | 'user'} message.role - The role of the message.
 * @property {string} message.content - The content of the message.
 * @property {Object} logprobs - The logprobs of the choice.
 * @property {'stop'} finish_reason - The finish reason of the choice.
 */

/**
 * @typedef {Object} ChatCompletionUsage
 * @property {number} prompt_tokens - The number of tokens in the prompt.
 * @property {number} completion_tokens - The number of tokens in the completion.
 * @property {number} total_tokens - The total number of tokens.
 */
