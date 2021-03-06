import html from 'html';
import css from 'css';
import useUids from 'useUids';
import collectForm from 'collectForm';

import { useContext, useState, useCallback } from 'preact/hooks';
import useEventListener from 'useEventListener';

import Title from './Title.js';
import MeaterCloud from './MeaterCloud.js';
import MeaterDevice from './MeaterDevice.js';

const styles = css`
  .loginForm {
    font-family: Arial;
  }
  .error {
    color: red;
  }
  .main {
    margin: 0 auto;
    width: 200px;
  }
`;

const calculateZoom = () => Math.min(
  document.documentElement.clientHeight / 230 * 0.96,
  document.documentElement.clientWidth / 200 * 0.96,
);

export default () => {
  const [zoom, setZoom] = useState(calculateZoom);
  const { devices, loggedIn, login, logout } = useContext(MeaterCloud);
  const [error, setError] = useState(null);
  const signIn = useCallback(async (event) => {
    event.preventDefault();
    const { email, password } = collectForm(event.target);
    try {
      await login(email, password);
    } catch (error) {
      setError(error.message);
    }
  });
  useEventListener(window, 'resize', () => setZoom(calculateZoom));
  const [textId, passwordId] = useUids(2);
  return html`
    <div className=${styles.main} style=${{ zoom }}>
      <${Title}>Meater Monitor</>
      ${loggedIn && (
        devices.length
        ? html`
          ${devices.map(device => html`
            <${MeaterDevice} ...${device} />
            <button onClick=${logout}>Log out</button>
          `)}
        `
        : html`
          <div>No active Meater devices.</div>
          <button onClick=${logout}>Log out</button>
        `
      )}
      
      ${!loggedIn && html`
        <form className=${styles.loginForm} onSubmit=${signIn}>
          <h2>Sign into Meater Cloud</h2>
          <p>(your credentials are not stored, but sent directly to Meater)</p>
          ${error && html`
            <div className=${styles.error}>${error}</div>
          `}
          <div>
            <label htmlFor=${textId}>
              Email: 
              <input type="text" name="email" id=${textId} />
            </label>
          </div>
          <div>
            <label htmlFor=${passwordId}>
              Password:
              <input type="password" name="password" id=${passwordId} />
            </label>
          </div>
          <button type="submit">Log in</button>
        </form>
      `}
    </div>
  `;
};