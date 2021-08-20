import html from 'html';
import { createContext } from 'preact';
import { useEffect, useRef, useCallback, useState } from 'preact/hooks';
import useSharedState from 'useSharedState';

const MEATER_ROOT = 'https://public-api.cloud.meater.com/v1';

const Context = createContext({});
const { Provider } = Context;

const MIN_INTERVAL = 30000;

Context.Provider = ({
  children,
  interval: initInterval = MIN_INTERVAL,
}) => {
  const [auth, setAuth] = useSharedState('meaterAuth', null);
  const [devices, setDevices] = useState([]);
  const [tick, setTick] = useState(0);
  const [polling, setPolling] = useState(initInterval < MIN_INTERVAL ? false : true);
  const [interval, setInterval] = useState(Math.max(initInterval, MIN_INTERVAL));

  const update = useCallback(async () => {
    if (!auth) return null;
    const { data } = await fetch(`${MEATER_ROOT}/devices`, {
      headers: {
        Authorization: `Bearer: ${auth.token}`,
      },
    }).then(r => r.json());
    setDevices(data.devices);
    return data.devices;
  }, [auth, setDevices]);

  const login = useCallback(async (email, password) => {
    if (!auth && email && password) {
      const response = await (fetch(`${MEATER_ROOT}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json()));
      if (response.statusCode !== 200) {
        throw new Error("Username or password is incorrect.");
      }
      setAuth(response.data);
      return;
    }
  }, [auth, setAuth]);

  const logout = useCallback(async () => {
    setAuth(null);
  }, [setAuth]);

  const timeout = useRef(null);

  useEffect(() => {
    if (!auth || !polling) return;
    update().then(() => {
      console.log('scheduling next tick');
      setTimeout(() => setTick(v => v + 1), interval);
    }).catch(error => {
      console.error("Giving up", error);
      setAuth(null);
    });
    return () => clearTimeout(timeout.current);
  }, [auth, polling, tick]);

  const value = {
    logout,
    login,
    update,
    poll: (atInterval = MIN_INTERVAL) => {
      setInterval(atInterval === true ? MIN_INTERVAL : Math.max(MIN_INTERVAL, atInterval));
      setPolling((atInterval && atInterval < MIN_INTERVAL && atInterval !== true) ? false : true);
    },
    devices,
    loggedIn: !!auth,
  };
  return html`<${Provider} value=${value}>${children}</>`;
};

export default Context;