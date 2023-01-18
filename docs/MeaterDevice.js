import html from 'html';
import css from 'css';

const HalfMeter = (props) => html`<path id="halfMeter" d="
  M50 0
  A 50.4 50.4 0 0 0 7.2 76.5
  l 8.7 -5.3 a 40.2 40.2 0 0 134.1 -61
  z
" ...${props} />`;

const Meter = () => html`
  <defs>
    <linearGradient id="cool" gradientTransform="rotate(90)">
      <stop offset="0%" stop-color="#e2212cff" />
      <stop offset="100%" stop-color="#3a54a4ff" />
    </linearGradient>
    <linearGradient id="warm" gradientTransform="rotate(90)">
      <stop offset="0%" stop-color="#e2212cff" />
      <stop offset="100%" stop-color="#921d1eff" />
    </linearGradient>
  </defs>
  <${HalfMeter} fill="url('#cool')" />
  <${HalfMeter} transform="translate(99, 0) scale(-1, 1)" fill="url('#warm')"/>
`;

const Marker = ({ temp, color }) => {
  if (Number.isNaN(parseFloat(temp))) return null;
  return html`
    <g transform-origin="50 50" transform=${`rotate(${temp * 230 / 205})`} >
      <path d="
        M 11, 69
        l -7.3, 7.5
        l -3.2, -6.8
        z" fill="#111F"/>
      <path d="
        M 9.6, 69.7
        l -5.7, 5.5
        l -2.2, -4.8
        z" fill=${color}/>
    </g>
  `;
};

const Spread = () => null;

const formatTemp = temp => Number.isNaN(temp) ? '--' : `${(temp * 9 / 5 + 32).toFixed(0)}ºF`;
const tempColor = temp => {
  if (Number.isNaN(temp)) return '#292';
  console.log(temp * 230 / 205);
}
const formatTime = (time, retSecs) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math[retSecs ? 'floor' : 'round']((time % 3600) / 60);
  const block = [];
  if (hours) {
    block.unshift(`${hours.toFixed(0)}h`);
  }
  if (retSecs) {
    if (minutes) {
      block.push(`${minutes.toFixed(0)}m`);
    }
    block.push(`${time % 60}s`);
  } else {
    block.push(`${minutes.toFixed(0)}m`);
  }
  return block.join(' ');
};

const bubble = css`
  .circle {
    width: 4em;
    height: 4em;
    border-radius: 2em;
    font-family: Arial;
    color: white;
    display: inline-flex;
    flex-direction: column;
    justify-content: space-evenly;
    text-align: center;
    text-shadow: 0 0 10px black, 0 0 10px black;
  }
  .circle label {
    font-size: 75%;
  }
`;

const Bubble = ({ color, label, content }) => html`
  <div 
    className=${bubble.circle}
    style=${{
      backgroundColor: color,
    }}
  >
    <label>${label}</label>
    <span >${content}</span>
  </div>
`;

const styles = css`
  .device {
    width: 200px;
  }
  .bubbles {
    display: flex;
    justify-content: space-evenly;
  }
  .cook {
    font-family: Arial;
    font-size: 10px;
    text-anchor: middle;
    fill: #EEE;
    text-shadow: 0 0 5px black;
  }
`;
export default ({
  width = 200,
  temperature: {
    internal,
    ambient
  },
  updated_at,
  cook,
}) => {
  const {
    name,
    state,
    temperature: {
      peak,
      target,
    } = {},
    time: {
      elapsed,
      remaining,
    } = {},
  } = cook || {};
  const lastUpdate = Math.round((Date.now() / 1000) - updated_at);
  return html`
    <div style=${{ width: `${width}px` }}>
      <div className=${styles.bubbles} style=${{ fontSize: `${width * 12 / 200}px`}}>
        <${Bubble} color="#52E" label="Internal" content=${formatTemp(internal)} />
        <${Bubble} color="#3C3" label="Target" content=${target ? formatTemp(target) : '--'} />
        <${Bubble} color="#E52" label="Ambient" content=${formatTemp(ambient)} />
      </div>
      <svg viewBox="-5 -10 110 86" width=${width} height=${width / 110 * 86} >
        <${Meter} />
        <${Spread} low=${peak} high=${target} />
        <${Marker} color="#52E" temp=${internal || '--'} />
        <${Marker} color="#3C3" temp=${target || '--'} />
        <${Marker} color="#E52" temp=${ambient || '--'} />
        <text className=${styles.cook.toString()} x="50" y="50">${name}</text>
        <text className=${styles.cook.toString()} x="50" y="60">
          ${remaining && remaining >= 0 && `ETA ${formatTime(remaining)}`}
          ${remaining < 0 && 'Estimating ETA'}
          ${remaining === undefined && '--'}
        </text>
        <text className=${styles.cook.toString()} x="0" y="0" style="text-anchor: start;">
          ${formatTime(lastUpdate, true)} ago
        </text>
        <text className=${styles.cook.toString()} x="50" y="30">
          for ${formatTime(elapsed)}
        </text>
      </svg>
    </div>
  `;
};