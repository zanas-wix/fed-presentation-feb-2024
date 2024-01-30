

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
  const content = `<html><body>
    <pre>${haiku}</pre> ${SECRETS.IMAGE}
  </body></html>`;
  const contentAsText = stripHTML(content);

  GmailApp.sendEmail(
    recipient,
    subject, 
    contentAsText, 
    { htmlBody: content }
  );
}

/**
 * Demo of Calendar API
 */
function demoNumberTwo() {
  /** @type {{horoscopes: { horoscope: string; date: string }[]}} */
  const response = JSON.parse(ChatGPT(`
    Generate some fake horoscopes for the sign Aries.
    I'd like a new horoscope each remaining Monday of the month
    based on the current date.

    Today is: ${new Date().toString()}

    Please return them in JSON & always in an array format:

    {
      horoscopes: Array<{
        date: '', // ISO date string
        horoscope: ''
      }>
    }
  `, 'json_object')); 

  // Ensure "Horoscopes" calendar exists
  let [calendar] = CalendarApp.getCalendarsByName('Horoscopes')
  if (calendar) calendar.deleteCalendar();
  calendar = CalendarApp.createCalendar('Horoscopes');

  for (const horoscope of response.horoscopes) {
    const calendarEvent = calendar.createAllDayEvent('⭐ Horoscope', new Date(horoscope.date))
    calendarEvent.setDescription(horoscope.horoscope);
  }
}

/**
 * Demo of button invocation & user input
 * 
 */
function demoNumberThree() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const a1 = {
    prompt: 'B1',
    watchlist: `A4:H${sheet.getLastRow()}`,
    output: 'B2'
  }
  const prompt = sheet.getRange(a1.prompt).getValue();

  const watchlistRange = sheet.getRange(a1.watchlist).getValues()

  const genieResponse = ChatGPT(`
    You are an expert stock analyst. You will get prompts where the user will post his prompt & his watchlist data.

    Provide the most helpful answer & formatted nicely in short paragraphs.

    The users prompt:
    """
    ${prompt}
    """

    Watchlist data:
    """
    ${JSON.stringify(watchlistRange)}
    """
    
  `);

  sheet.getRange(a1.output).setValue(genieResponse);
}

/**
 * Demo of Drive API + triggers
 */
function demoNumberFour() {

}

/**
 * Calls the OpenAI API to get a completion for the provided prompt.
 * @param {string} prompt - The prompt for the completion.
 * @param {'json_object' | 'text'} response_format
 */
function ChatGPT(prompt, response_format = 'text') {
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
        response_format: {
          type: response_format
        },
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
        max_tokens: 500,
      }),
    }
  );
  /** @type {ChatCompletion} */
  const response = JSON.parse(httpResponse.getContentText());

  if (response.choices[0].finish_reason === 'length') {
    throw new Error('not enough tokens')
  }

  const content = response.choices[0].message.content;

  Logger.log(`ChatGPT: ${content}`);

  return content;
}

/**
 * Strips all HTML tags, leaving only text content
 * @param {string} html
 * @returns {string}
 */
function stripHTML(html) {
  return XmlService.parse(htmlBody).getContent(0).getValue().trim()
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
