import React, { useEffect, useRef, useState } from "react";

const poses = {
  hello: { file: 'chetan-desk-avatar.png', text: 'Hi! I’m Chetan. Glad you’re here.', icon: '👋', alt: 'Chetan smiling and greeting you from his laptop' },
  code: { file: 'chetan-desk-focused.png', text: 'Focused. Building something useful.', icon: '</>', alt: 'Chetan working at his laptop with a focused expression' },
  coffee: { file: 'chetan-desk-sip.png', text: 'A quick sip. Then back to it.', icon: '☕', alt: 'Chetan sipping coffee while looking toward his laptop' },
};
const sequence = ['hello', 'code', 'coffee', 'code'];
const durations = [2400, 4200, 2400, 4200];

export default function DeskBuddy() {
  const host = useRef(null);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState([]);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden));
    observer.observe(host.current);
    const visibility = () => setVisible(!document.hidden && host.current.getBoundingClientRect().bottom > 0 && host.current.getBoundingClientRect().top < innerHeight);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', change); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (loaded.length !== 3 || reduced || !visible || step >= 12) return;
    const timer = setTimeout(() => setStep(n => n + 1), durations[step % 4]);
    return () => clearTimeout(timer);
  }, [step, loaded, reduced, visible]);
  const mood = reduced || step >= 12 ? 'code' : sequence[step % 4];
  return (
    <div ref={host} className="hero-buddy" data-mood={mood} data-step={step} data-complete={step >= 12}>
      <span className="hello-tag" aria-hidden={mood !== 'hello'}><span aria-hidden="true">👋</span> Hello!</span>
      <div className="hero-avatar">
        {Object.entries(poses).map(([name, item]) => <img key={name} data-pose={name} className={`avatar-pose ${mood === name ? 'pose-active' : ''}`} src={`${import.meta.env.BASE_URL}assets/images/${item.file}`} width="1254" height="1254" fetchPriority={name === 'hello' ? 'high' : 'auto'} onLoad={() => setLoaded(previous => previous.includes(name) ? previous : [...previous, name])} alt={mood === name ? item.alt : ''} aria-hidden={mood !== name}/>)}
      </div>
    </div>
  );
}
