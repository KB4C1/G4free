# g4free

Small utility wrappers for automating ChatGPT/Grok via Puppeteer.

Usage (after installing from npm or building locally):

ChatGPT example:
```js
import { ChatGPT, Grok } from 'g4free';

(async () => {
  const chat = new ChatGPT();
  await chat.init();
  const res = await chat.query({ message: 'Who is Jeffrey Epstein?' });
  console.log(res);
  await chat.close();
})();
```

Grok example:
```js
import { ChatGPT, Grok } from 'g4free';

(async () => {
  const grok = new Grok();
  await grok.init();
  const res = await grok.query({ message: 'Who is Charlie Kirk?' });
  console.log(res);
  await grok.close();
})();
```
