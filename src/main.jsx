import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowUp, Check, UserRound, UsersRound, RotateCw, ChevronLeft, Infinity as InfinityIcon, Trophy, Sparkles } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { question, swipeDirection, remainingSeconds } from './game';
import '@fontsource/nunito/latin-500.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import './style.css';
registerSW({ immediate: true });

function ConfettiShapes({ small = false }) {
  return <div className={`shapes ${small ? 'small' : ''}`} aria-hidden="true"><span className="shape square one"/><span className="shape dot two"/><span className="shape triangle three"/><span className="shape cross four">+</span><span className="shape dot five"/><span className="shape triangle six"/></div>;
}
function App() {
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState('solo');
  const [names, setNames] = useState(['', '']);
  const [max, setMax] = useState(8);
  const [duration, setDuration] = useState(60);
  const [scores, setScores] = useState([0, 0]);
  const [ties, setTies] = useState(0);
  const [q, setQ] = useState(() => question(8));
  const [revealed, setRevealed] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(60);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState(null);
  const [cardId, setCardId] = useState(0);
  const [ending, setEnding] = useState(false);
  const pointer = useRef(null);
  const moving = useRef(false);
  const timer = useRef(null);
  const locked = useRef(false);
  const leftName = mode === 'solo' ? 'Incorrect' : names[0].trim();
  const rightName = mode === 'solo' ? 'Correct' : names[1].trim();
  const total = scores[0] + scores[1] + ties;

  useEffect(() => {
    if (screen !== 'play' || deadline === null) return;
    const tick = () => {
      const seconds = remainingSeconds(deadline);
      setRemaining(seconds);
      if (seconds === 0) {
        locked.current = true;
        clearTimeout(timer.current);
        setEnding(false);
        setScreen('results');
      }
    };
    tick();
    const id = setInterval(tick, 150);
    return () => clearInterval(id);
  }, [screen, deadline]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function start() {
    clearTimeout(timer.current);
    locked.current = false;
    pointer.current = null;
    setScores([0, 0]); setTies(0); setQ(question(max)); setRevealed(false);
    setDrag({ x: 0, y: 0 }); setDragging(false); setExit(null); setEnding(false);
    setRemaining(duration); setDeadline(duration === null ? null : Date.now() + duration * 1000);
    setCardId(n => n + 1); setScreen('play');
  }
  function finish() {
    locked.current = true; clearTimeout(timer.current); setEnding(false); setScreen('results');
  }
  function tapScore(direction) {
    if (locked.current || ending || (deadline !== null && Date.now() >= deadline)) return;
    if (!revealed) setRevealed(true);
    else mark(direction);
  }
  function mark(direction) {
    if (!revealed || locked.current || ending || (deadline !== null && Date.now() >= deadline)) return;
    locked.current = true;
    setDragging(false); setExit(direction);
    if (direction === 'tie') setTies(n => n + 1);
    else setScores(old => old.map((n, i) => n + (i === (direction === 'left' ? 0 : 1) ? 1 : 0)));
    timer.current = setTimeout(() => {
      setQ(old => question(max, old)); setRevealed(false); setExit(null);
      setDrag({ x: 0, y: 0 }); setCardId(n => n + 1); locked.current = false;
    }, 260);
  }
  function pointerDown(e) {
    if (locked.current || ending || !e.isPrimary || e.button !== 0) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    moving.current = false; e.currentTarget.setPointerCapture(e.pointerId); setDragging(true);
  }
  function pointerMove(e) {
    if (!pointer.current) return;
    const x = e.clientX - pointer.current.x;
    const y = e.clientY - pointer.current.y;
    if (Math.abs(x) + Math.abs(y) > 8) moving.current = true;
    setDrag({ x, y: mode === 'duo' ? y : y * 0.18 });
  }
  function pointerUp(e) {
    if (!pointer.current) return;
    const direction = swipeDirection(e.clientX - pointer.current.x, e.clientY - pointer.current.y, mode);
    pointer.current = null; setDragging(false);
    if (!moving.current) setRevealed(true);
    else if (direction && revealed) mark(direction);
    setDrag({ x: 0, y: 0 });
  }
  const hint = revealed ? swipeDirection(drag.x, drag.y, mode) : null;
  const timeLabel = remaining === null ? <InfinityIcon size={34}/> : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  const cardTransform = exit ? `translate(${exit === 'left' ? '-130%' : exit === 'right' ? '130%' : '0'}, ${exit === 'tie' ? '-130%' : '10%'}) rotate(${exit === 'left' ? -22 : exit === 'right' ? 22 : 0}deg)` : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 20}deg)`;

  return <div className="app-shell"><aside className="desktop-note"><span>Little moments.<br/><strong>Big brain energy.</strong></span></aside><main className={`app-panel ${screen === 'play' ? 'game-panel' : ''}`}>
    <header className="flex items-center justify-between gap-3">
      {screen === 'setup' ? <button className="icon-button" aria-label="Back to game mode" onClick={() => setScreen('welcome')}><ChevronLeft/></button> : screen === 'play' ? <button className="icon-button" aria-label="End game" onClick={() => setEnding(true)}><ChevronLeft/></button> : <span className="header-spacer" aria-hidden="true"/>}
      <span className="brand">{screen === 'play' ? mode === 'solo' ? 'Single player' : 'Two players' : 'Times tables'}</span>
      {screen === 'play' ? <button className="end-button" onClick={() => setEnding(true)}>End</button> : <span className="header-spacer"/>}
    </header>

    {screen === 'welcome' && <section className="screen welcome-screen">
      <ConfettiShapes/>
      <div className="intro"><span className="eyebrow">A LITTLE PRACTICE. A LOT OF FUN.</span><h1>Ready to play<span className="blue">?</span></h1><p>Big numbers start with little wins.</p></div>
      <div className="mode-grid" role="group" aria-label="Game mode">
        <button className={`mode-card ${mode === 'solo' ? 'selected' : ''}`} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}><UserRound size={40} strokeWidth={2.3}/><strong>Single player</strong><span>Find your rhythm.<br/>Build your confidence.</span>{mode === 'solo' && <Check className="selection-check" size={16}/>}</button>
        <button className={`mode-card ${mode === 'duo' ? 'selected' : ''}`} aria-pressed={mode === 'duo'} onClick={() => setMode('duo')}><UsersRound size={44} strokeWidth={2.3}/><strong>Two players</strong><span>A friendly challenge.<br/>Play together.</span>{mode === 'duo' && <Check className="selection-check" size={16}/>}</button>
      </div>
      <form className="welcome-form" onSubmit={e => {e.preventDefault(); setScreen('setup');}}>
        {mode === 'duo' ? <div className="name-fields">{names.map((name, i) => <label key={i}><span className={`player-dot player-${i}`}/>Player {i + 1}<input required maxLength={18} value={name} placeholder={i === 0 ? 'e.g. Alex' : 'e.g. Sam'} autoComplete="off" onChange={e => setNames(old => old.map((n, j) => j === i ? e.target.value : n))} onBlur={() => setNames(old => old.map(n => n.trim()))}/></label>)}</div> : <div className="solo-note"><Sparkles size={22}/><p>No pressure. Just practice.<br/><span>You’ve got this, one card at a time.</span></p></div>}
        <button className="primary" disabled={mode === 'duo' && names.some(n => !n.trim())}>Let’s do this <ArrowRight size={21}/></button>
      </form>
      <div className="footer-note">A little better, every time.</div>
    </section>}

    {screen === 'setup' && <section className="screen setup-screen">
      <div className="intro"><span className="eyebrow">YOUR GAME, YOUR PACE</span><h1>Make it<br/>your game<span className="blue">.</span></h1><p>Choose a challenge that feels right.</p></div>
      <fieldset><legend>Biggest number <span className="selection-pill">Up to {max}</span></legend><div className="number-grid">{Array.from({length: 12}, (_, i) => i + 1).map(n => <button key={n} className={`number-button ${max === n ? 'active' : ''}`} aria-pressed={max === n} onClick={() => setMax(n)}>{n}</button>)}</div><p className="field-help">Both numbers will be between 1 and {max}.</p></fieldset>
      <fieldset className="time-field"><legend>Time limit</legend><div className="time-grid">{[[30,'30 sec'],[60,'1 min'],[null,'No limit']].map(([value,label]) => <button key={label} className={`time-button ${duration === value ? 'active' : ''}`} aria-pressed={duration === value} onClick={() => setDuration(value)}>{label}</button>)}</div></fieldset>
      <div className="setup-bottom"><div className="game-summary">{mode === 'solo' ? 'Just you and your next little win.' : `${names[0].trim()} vs ${names[1].trim()}. Let’s go!`}</div><button className="primary" onClick={start}>Let’s play <ArrowRight size={21}/></button></div>
    </section>}

    {screen === 'play' && <section className="screen play-screen">
      <div className="scoreboard"><div className="score coral"><span>{leftName}</span><strong key={scores[0]}>{scores[0]}</strong></div><div className={`timer ${remaining !== null && remaining <= 10 ? 'urgent' : ''}`} role="timer" aria-label={remaining === null ? 'No time limit' : `${remaining} seconds remaining`}><strong>{timeLabel}</strong><span>{remaining === null ? 'NO LIMIT' : 'TIME LEFT'}</span></div><div className="score teal"><span>{rightName}</span><strong key={scores[1]}>{scores[1]}</strong></div></div>
      <div className="time-track">{duration !== null && <div style={{width: `${remaining / duration * 100}%`}} className={remaining <= 10 ? 'urgent' : ''}/>}</div>
      <div className="card-area"><ConfettiShapes small/><div className="card-stack"/>
        <div key={cardId} className="card-entry"><button className={`flashcard ${dragging ? 'dragging' : ''} ${exit ? 'exiting' : ''} hint-${hint}`} style={{ transform: cardTransform }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => {pointer.current = null; setDragging(false); setDrag({x:0,y:0});}} onClick={e => {if (e.detail === 0 && !locked.current) setRevealed(true);}} aria-label={revealed ? `${q.a} times ${q.b} equals ${q.a*q.b}` : `${q.a} times ${q.b}. Tap to reveal answer`}>
          <div className={`card-flipper ${revealed ? 'flipped' : ''}`}><div className="card-face front" aria-hidden={revealed}><span className="card-eyebrow">WHAT IS</span><span className="question">{q.a} <span>×</span> {q.b}</span><span className="reveal-hint">Tap to reveal <RotateCw size={19}/></span></div><div className="card-face back" aria-hidden={!revealed}><span className="answer-equation">{q.a} × {q.b} =</span><span className="answer">{q.a * q.b}</span><span className="reveal-hint">{mode === 'solo' ? 'How did you do?' : 'Who got it right?'}</span></div></div>
          {hint && <span className={`drag-badge ${hint}`}>{hint === 'tie' ? 'TIE' : hint === 'left' ? leftName : rightName}</span>}
        </button></div>
      </div>
      <div className={`answer-controls ${mode === 'duo' ? 'duo' : ''}`}><button className="score-button coral-button" disabled={!!exit} onClick={() => tapScore('left')}><ArrowLeft size={21}/><span>{leftName}</span></button>{mode === 'duo' && <button className="score-button tie-button" disabled={!!exit} onClick={() => tapScore('tie')}><ArrowUp size={20}/><span>Tie</span></button>}<button className="score-button teal-button" disabled={!!exit} onClick={() => tapScore('right')}><span>{rightName}</span><ArrowRight size={21}/></button></div>
      <p className="play-help" aria-live="polite">{revealed ? mode === 'solo' ? 'Swipe left or right, or use the buttons.' : 'Swipe toward a player. Swipe up for a tie.' : 'Tap the card or a button to reveal the answer.'}</p>
      <span className="round-label">{mode === 'duo' && ties > 0 ? `${ties} ${ties === 1 ? 'tie' : 'ties'} · ` : ''}Numbers up to {max}</span>
    </section>}

    {screen === 'results' && <section className="screen results-screen"><ConfettiShapes/><div className="trophy"><Trophy size={42}/></div><span className="eyebrow">{duration !== null && remaining === 0 ? 'TIME’S UP!' : 'THAT’S A WRAP!'}</span><h1>{total === 0 ? 'Ready next time!' : mode === 'solo' ? 'Look at you go!' : scores[0] === scores[1] ? 'It’s a draw!' : `${scores[0] > scores[1] ? leftName : rightName} wins!`}</h1><p>{total === 0 ? 'Your next little win is waiting.' : 'Every card is a little more confidence.'}</p><div className="result-scores"><div className="score coral"><span>{leftName}</span><strong>{scores[0]}</strong></div><div className="score teal"><span>{rightName}</span><strong>{scores[1]}</strong></div></div><p className="result-detail">{total} {total === 1 ? 'card' : 'cards'} played{mode === 'duo' ? ` · ${ties} ${ties === 1 ? 'tie' : 'ties'}` : total > 0 ? ` · ${Math.round(scores[1] / total * 100)}% correct` : ''}</p><div className="result-actions"><button className="primary" onClick={start}>Play again <RotateCw size={20}/></button><button className="secondary" onClick={() => setScreen('setup')}>Change challenge</button><button className="text-button" onClick={() => setScreen('welcome')}>Back to start</button></div></section>}
    {ending && <div className="modal-backdrop"><EndDialog onCancel={() => setEnding(false)} onEnd={finish}/></div>}
  </main><span className="desktop-footer">Made for curious minds.</span></div>;
}
function EndDialog({ onCancel, onEnd }) {
  const dialog = useRef(null);
  useEffect(() => {dialog.current.showModal(); return () => dialog.current?.close();}, []);
  return <dialog ref={dialog} className="end-dialog" onCancel={e => {e.preventDefault(); onCancel();}} aria-labelledby="end-title"><h2 id="end-title">All done for now?</h2><p>Finish this round and see your score.</p><button className="primary" onClick={onCancel} autoFocus>Keep playing</button><button className="secondary" onClick={onEnd}>End game</button></dialog>;
}
createRoot(document.getElementById('root')).render(<App/>);
