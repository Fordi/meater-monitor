import { useState } from 'preact/hooks';

export default (count = 1, prefix = '') => {
  const [uids] = useState(() => {
    const ret = [];
    for (let i = 0; i < count; i++) {
      ret.push(`${prefix}_${Math.random().toString(36).substr(2)}`);
    }
    return ret;
  });
  return uids;
};