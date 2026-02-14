# g4free

Small utility wrappers for automating ChatGPT/Grok via Puppeteer.

Usage (after installing from npm or building locally):

```js
import { ChatGPT, Grok } from 'g4free';

(async () => {
  const chat = new ChatGPT();
  await chat.init();
  const res = await chat.query({ message: 'Hi' });
  console.log(res);
  await chat.close();
})();
```
