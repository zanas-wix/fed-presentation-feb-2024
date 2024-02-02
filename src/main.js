// main.gs

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

  GmailApp.sendEmail(recipient, subject, contentAsText, { htmlBody: content });
}

/**
 * Demo of Calendar API
 */
function demoNumberTwo() {
  /** @type {{horoscopes: { horoscope: string; date: string }[]}} */
  const response = JSON.parse(
    ChatGPT(
      `
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
  `,
      "json_object"
    )
  );

  // Ensure "Horoscopes" calendar exists
  let [calendar] = CalendarApp.getCalendarsByName("Horoscopes");
  if (calendar) calendar.deleteCalendar();
  calendar = CalendarApp.createCalendar("Horoscopes");

  for (const horoscope of response.horoscopes) {
    const calendarEvent = calendar.createAllDayEvent(
      "⭐ Horoscope",
      new Date(horoscope.date)
    );
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
    prompt: "B1",
    watchlist: `A4:H${sheet.getLastRow()}`,
    output: "B2",
  };
  const prompt = sheet.getRange(a1.prompt).getValue();

  const watchlistRange = sheet.getRange(a1.watchlist).getValues();

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
  const spreadofsheet = SpreadsheetApp.getActiveSpreadsheet();
  const stocksBufferSheetId = copyStocksToBufferSheet();
  const url =
    "https://docs.google.com/spreadsheets/d/" +
    spreadofsheet.getId() +
    "/export?exportFormat=pdf&format=pdf" + // export as pdf / csv / xls / xlsx
    "&size=A4" + // paper size legal / letter / A4
    "&portrait=true" + // orientation, false for landscape
    "&fitw=true" + // fit to page width, false for actual size
    "&sheetnames=false&printtitle=false" + // hide optional headers and footers
    "&pagenumbers=false&gridlines=false" + // hide page numbers and gridlines
    "&fzr=false" + // do not repeat row headers (frozen rows) on each page
    "&gid=" +
    stocksBufferSheetId; // the sheet's Id

  // request export url
  const blob = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
  }).getBlob();

  // Save the PDF to the specified folder
  const FOLDER_ID = "1mgidTe9NW1S1enAZMrajjNHDI9DqLJpC"; // ID of the folder to save the PDF
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const pdfName = "watchlist.jpg";
  const files = folder.getFilesByName(pdfName);
  while (files.hasNext()) files.next().setTrashed(true);

  const pdfFile = folder.createFile(blob).setName(pdfName);

  // Send the PDF via email
  const recipient = "zanass@wix.com";
  const subject = "⭐ Stocks watchlist";
  const body = "";

  GmailApp.sendEmail(recipient, subject, body, {
    attachments: [pdfFile.getAs(MimeType.PDF)],
  });
}

function copyStocksToBufferSheet() {
  const sheet = SpreadsheetApp.getActive();
  const data = sheet.getSheetByName("Stocks").getDataRange().getDisplayValues();

  if (data.length > 0) {
    let bufferSheet = sheet.getSheetByName("Copy of Stocks");

    if (bufferSheet) sheet.deleteSheet(bufferSheet);

    bufferSheet = sheet.getSheetByName("Stocks").copyTo(sheet);

    bufferSheet.clear({ contentsOnly: true });
    bufferSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

    SpreadsheetApp.flush();

    return bufferSheet.getSheetId();
  }
}

/**
 * Calls the OpenAI API to get a completion for the provided prompt.
 * @param {string} prompt - The prompt for the completion.
 * @param {'json_object' | 'text'} response_format
 * @customfunction
 */
function ChatGPT(prompt, response_format = "text") {
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
          type: response_format,
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

  if (response.choices[0].finish_reason === "length") {
    throw new Error("not enough tokens");
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
  return XmlService.parse(html).getContent(0).getValue().trim();
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
