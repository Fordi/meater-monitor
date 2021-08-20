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
        z" fill="#FFFFFFFF"/>
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

const formatTime = time => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.round((time % 3600) / 60);
  const block = [`${minutes.toFixed(0)}m`];
  if (hours) {
    block.unshift(`${hours.toFixed(0)}h`);
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
  return html`
    <div style=${{ width: `${width}px` }}>
      <div className=${styles.bubbles} style=${{ fontSize: `${width * 12 / 200}px`}}>
        <${Bubble} color="purple" label="Internal" content=${formatTemp(internal)} />
        <${Bubble} color="blue" label="Target" content=${target ? formatTemp(target) : '--'} />
        <${Bubble} color="green" label="Ambient" content=${formatTemp(ambient)} />
      </div>
      <svg viewBox="-5 -10 110 86" width=${width} height=${width / 110 * 86} >
        <${Meter} />
        <${Spread} low=${peak} high=${target} />
        <${Marker} color="purple" temp=${internal || '--'} />
        <${Marker} color="blue" temp=${target || '--'} />
        <${Marker} color="green" temp=${ambient || '--'} />
        <text font-family="Arial" font-size="10" text-anchor="middle" x="50" y="45">${name}</text>
        <text font-family="Arial" font-size="10" text-anchor="middle" x="50" y="55">
          ${remaining && remaining >= 0 && formatTime(remaining)}
          ${remaining < 0 && 'Estimating'}
          ${remaining === undefined && '--'}
        </text>
      </svg>
    </div>
  `;
};