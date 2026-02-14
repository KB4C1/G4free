import puppeteer from 'puppeteer';

class ChatGPT {
  constructor() {
    this.browser = null;

    this.availableModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4o',
      'gpt-4.1',
      'gpt-5-2',
      'o1',
      'o3-mini'
    ];

    this.defaultModel = 'gpt-4o';
    this.inputFieldSelector = 'textarea';
    this.assistantResultSelector =
      'div[data-message-author-role="assistant"] .markdown';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      userDataDir: './profile',
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
  }

  async waitForStableText(page, selector, { stableMs = 1000, timeout = 60000 } = {}) {
    let lastText = '';
    let lastChange = Date.now();

    while (Date.now() - lastChange < stableMs) {
      await new Promise(r => setTimeout(r, 300));

      const text = await page.$eval(selector, el => el.innerText).catch(() => '');

      if (text !== lastText) {
        lastText = text;
        lastChange = Date.now();
      }

      if (Date.now() - lastChange > timeout) {
        break;
      }
    }

    return lastText.trim();
  }

  async query({ model = this.defaultModel, message }) {
    const page = await this.browser.newPage();

    await page.goto('https://chatgpt.com', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector(this.inputFieldSelector);
    await page.type(this.inputFieldSelector, message);
    await page.keyboard.press('Enter');

    const initialCount = await page.$$eval(
      this.assistantResultSelector,
      nodes => nodes.length
    );

    await page.waitForFunction(
      (selector, count) => document.querySelectorAll(selector).length > count,
      { timeout: 60000 },
      this.assistantResultSelector,
      initialCount
    );

    const response = await this.waitForStableText(page, this.assistantResultSelector);

    await page.close();
    return response;
  }

  async close() {
    await this.browser.close();
  }
}

// async function main() {
//   const chat = new ChatGPT();
//   await chat.init();

//   const response = await chat.query({
//     model: 'gpt-4',
//     message: 'Привєт. Як ся маєш?'
//   });

//   console.log('ChatGPT response:\n', response);

//   await chat.close();
// }

// await main();

export default ChatGPT;
