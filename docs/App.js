import html from "html";
import css from "css";
import useUids from "useUids";
import collectForm from "collectForm";

import { useContext, useState, useCallback, useEffect } from "preact/hooks";
import useEventListener from "useEventListener";

import Title from "./Title.js";
import MeaterCloud from "./MeaterCloud.js";
import MeaterDevice from "./MeaterDevice.js";

const styles = css`
  .loginForm {
    font-family: Arial;
  }
  .error {
    color: red;
  }
  .main {
    margin: 0 auto;
  }
  button {
    background-color: #222;
    border: 2px solid #eee;
    color: #eee;
    border-radius: 2px;
    padding: 0.5em 1em;
  }
  .logout {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .meaterGrid {
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const GRID = [200, 230];

export default () => {
  const { devices, loggedIn, login, logout } = useContext(MeaterCloud);
  const calculateZoom = useCallback(() => {
    const screenAspect =
      document.documentElement.clientWidth /
      document.documentElement.clientHeight;
    const gridAspect = GRID[0] / GRID[1];
    const squareAspect = screenAspect / gridAspect;
    let repeatHeight, repeatWidth;
    if (squareAspect < 1) {
      repeatHeight = Math.ceil(Math.sqrt(devices.length / squareAspect));
      repeatWidth = Math.floor(devices.length / repeatHeight);
      repeatHeight = Math.ceil(devices.length / repeatWidth);
    } else {
      repeatWidth = Math.ceil(Math.sqrt(devices.length / squareAspect));
      repeatHeight = Math.floor(devices.length / repeatWidth);
      repeatWidth = Math.ceil(devices.length / repeatHeight);
    }

    return Math.min(
      (document.documentElement.clientWidth / (repeatWidth * GRID[0])) * 0.9,
      (document.documentElement.clientHeight / (repeatHeight * GRID[1])) * 0.9
    );
  }, [devices.length]);
  const [zoom, setZoom] = useState(calculateZoom);

  const [error, setError] = useState(null);
  const signIn = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = collectForm(event.target);
      try {
        await login(email, password);
      } catch (error) {
        setError(error.message);
      }
    },
    [login]
  );
  useEventListener(window, "resize", () => setZoom(calculateZoom));
  useEffect(() => {
    setZoom(calculateZoom);
  }, [calculateZoom]);
  const [textId, passwordId] = useUids(2);
  return html`
    ${
      loggedIn &&
      html`
        <button onClick=${logout} className=${styles.logout}>Log out</button>
      `
    }
    <div className=${styles.main} style=${{ zoom }}>
      <${Title}>Meater Monitor</${Title}>
      ${
        loggedIn &&
        html`
          <div className=${styles.meaterGrid}>
            ${devices.length
              ? html`
                  ${devices.map(
                    (device) => html`<${MeaterDevice} ...${device} /> `
                  )}
                `
              : html` <div>No active Meater devices.</div> `}
          </div>
        `
      }
      ${
        !loggedIn &&
        html`
          <form className=${styles.loginForm} onSubmit=${signIn}>
            <h2>Sign into Meater Cloud</h2>
            <p>
              (your credentials are not stored, but sent directly to Meater)
            </p>
            ${error && html` <div className=${styles.error}>${error}</div> `}
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
        `
      }
    </div>
  `;
};
