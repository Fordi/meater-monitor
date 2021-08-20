import { render } from 'preact';
import html from 'html';

import App from './App.js';
import MeaterCloud from './MeaterCloud.js';


(async () => {
  render(
    html`
      <${MeaterCloud.Provider}>
        <${App} />
      </>
    `, document.body
  );
})();
