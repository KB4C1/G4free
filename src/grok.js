import puppeteer from 'puppeteer';

class Grok {
  constructor() {
    this.browser = null;
    this.availableModels = [
        'grok-3-mini',
        'grok-3',
        'grok-4-0709',
        'grok-4-fast-non-reasoning',
        'grok-4-fast-reasoning',
        'grok-4-1-fast-non-reasoning',
        'grok-4-1-fast-reasoning'
        ];

    this.defaultModel = 'grok-3';
    this.inputFieldSelector = 'div[contenteditable="true"]';
    this.assistantResultSelector =
      'div[class="message-bubble relative rounded-3xl text-primary min-h-7 prose dark:prose-invert break-words prose-p:opacity-100 prose-strong:opacity-100 prose-li:opacity-100 prose-ul:opacity-100 prose-ol:opacity-100 prose-ul:my-1 prose-ol:my-1 prose-li:my-2 last:prose-li:mb-3 prose-li:ps-1 prose-li:ms-1 w-full max-w-none"]';
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

    await page.goto('https://grok.com', {
      waitUntil: 'networkidle2'
    });

    // await page.click(this.inputFieldSelector);
    await page.type(this.inputFieldSelector, message);
    await page.keyboard.press('Enter');

    if (await page.$('div[class="w-fit p-4 bg-card shadow-sm border border-input-border rounded-2xl ml-4 @md/mainview:mx-4"]')) {
        return 'Grok is very busy at that moment.';
    }
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
    if (!response.trim()) {
        return 'Grok did not return any response.';
    }
    return response;
  }

  async close() {
    await this.browser.close();
  }
}

// async function main() {
//   const chat = new Grok();
//   await chat.init();

//   const response = await chat.query({
//     model: 'grok-3',
//     message: 'Привєт. Як ся маєш?'
//   });

//   console.log('Grok response:\n', response);

//   await chat.close();
// }

// await main();

export default Grok;
