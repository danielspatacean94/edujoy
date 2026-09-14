import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChildGenre } from '@shared/types/child';
import { LoaderCircle, Play, Volume2 } from 'lucide-react';
import { childrenService, type Child } from '@/services/children.service';
import { groupsService, type Group } from '@/services/groups.service';
import { errorMessage } from '@/services/api-error';
import { useChildPhoto } from '@/hooks/use-child-photo';

const COLORS = [
  '#f9b4ab',
  '#b8d8d8',
  '#f7d794',
  '#c7ceea',
  '#b5ead7',
  '#ffdac1',
];

function WinnerCelebration({
  child,
  onClose,
}: {
  child: Child;
  onClose: () => void;
}) {
  const { src, onError } = useChildPhoto(child.id, child.photoKey);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Câștigătorul roții"
    >
      <div className="wheel-winner-modal relative w-full max-w-sm overflow-visible rounded-[2rem] bg-white p-6 text-center shadow-2xl">
        <span className="attendance-fireworks" aria-hidden="true">
          {[0, 1, 2].map((burst) => (
            <span
              key={burst}
              className={`attendance-firework attendance-firework-${burst}`}
            >
              {Array.from({ length: 12 }, (_, particle) => (
                <span
                  key={particle}
                  className="attendance-firework-particle"
                  style={
                    {
                      '--firework-angle': `${particle * 30}deg`,
                      '--firework-distance': `${34 + (particle % 3) * 12}px`,
                      '--firework-color': [
                        '#fbbf24',
                        '#fb7185',
                        '#38bdf8',
                        '#a78bfa',
                        '#34d399',
                        '#fb923c',
                      ][particle % 6],
                      '--firework-delay': `${burst * 180}ms`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
          ))}
        </span>
        <p className="eyebrow text-brand-700">COPILUL ALES</p>
        <div className="mx-auto mt-2 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-8 border-amber-200 bg-amber-50 text-3xl font-bold text-brand-700 shadow-lg">
          {src ? (
            <img
              src={src}
              alt={`Fotografia lui ${child.name}`}
              className="h-full w-full object-cover"
              onError={onError}
            />
          ) : (
            child.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <h2 className="mt-4 text-3xl font-bold text-brand-800">{child.name}</h2>
        <p className="mt-1 text-slate-500">
          {child.name} a fost {selectedLabel(child.genre)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continuă
        </button>
      </div>
    </div>
  );
}

function selectedLabel(genre: ChildGenre | null): string {
  return genre === 'female' ? 'selectată' : 'selectat';
}

function announceWinner(name: string) {
  const winnerSound = new Audio('/winner.mp3');
  winnerSound.volume = 0.10;
  void winnerSound.play().catch(() => null);
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(
    `${name}, roata te-a ales pe tine!`,
  );
  speech.lang = 'ro-RO';
  speech.rate = 0.8;
  speech.pitch = 1.15;
  window.speechSynthesis.speak(speech);
}

function announceStart() {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance('Să vedem pe cine alege roata');
  speech.lang = 'ro-RO';
  speech.rate = 0.85;
  speech.pitch = 1.15;
  window.speechSynthesis.speak(speech);
}

function WheelPhoto({
  child,
  angle,
  radius,
  wheelRotation,
}: {
  child: Child;
  angle: number;
  radius: string;
  wheelRotation: number;
}) {
  const { src, onError } = useChildPhoto(child.id, child.photoKey);
  return (
    <span
      className="absolute left-1/2 top-1/2 z-20 flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 sm:w-28"
      style={{
        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * ${radius})) rotate(${-angle}deg)`,
      }}
    >
      <span
        className="flex flex-col items-center gap-1"
        style={{ transform: `rotate(${-wheelRotation}deg)` }}
      >
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-xs font-bold text-slate-600 shadow-lg sm:h-16 sm:w-16">
          {src ? (
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              onError={onError}
            />
          ) : (
            child.name.slice(0, 2).toUpperCase()
          )}
        </span>
        <span className="max-w-full truncate rounded-md bg-white/90 px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-slate-800 shadow-sm sm:text-xs">
          {child.name}
        </span>
      </span>
    </span>
  );
}

export function ChildrenWheelPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [winner, setWinner] = useState<Child | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [celebrationWinner, setCelebrationWinner] = useState<Child | null>(
    null,
  );
  const spinTimer = useRef<number | null>(null);
  const celebrationTimer = useRef<number | null>(null);

  useEffect(() => {
    groupsService
      .all()
      .then(setGroups)
      .catch((cause) => setError(errorMessage(cause)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!groupId) {
      setChildren([]);
      setWinner(null);
      setCelebrationWinner(null);
      return;
    }
    setLoading(true);
    setError('');
    setWinner(null);
    setCelebrationWinner(null);
    childrenService
      .list({ page: 1, search: '', limit: 1000, groupId })
      .then((result) => setChildren(result.data))
      .catch((cause) => setError(errorMessage(cause)))
      .finally(() => setLoading(false));
  }, [groupId]);
  useEffect(
    () => () => {
      if (spinTimer.current !== null) window.clearTimeout(spinTimer.current);
      if (celebrationTimer.current !== null)
        window.clearTimeout(celebrationTimer.current);
    },
    [],
  );

  const wheelBackground = useMemo(() => {
    if (!children.length) return '#e2e8f0';
    const slice = 360 / children.length;
    return `conic-gradient(${children.map((_, index) => `${COLORS[index % COLORS.length]} ${index * slice}deg ${(index + 1) * slice}deg`).join(', ')})`;
  }, [children]);

  function spin() {
    if (spinning || !children.length) return;
    announceStart();
    const index = Math.floor(Math.random() * children.length);
    const slice = 360 / children.length;
    const target = 360 - (index * slice + slice / 2);
    setWinner(null);
    setSpinning(true);
    setRotation((current) => current + 1440 + target - (current % 360));
    spinTimer.current = window.setTimeout(() => {
      const selected = children[index];
      setWinner(selected);
      setCelebrationWinner(selected);
      celebrationTimer.current = window.setTimeout(
        () => setCelebrationWinner(null),
        3500,
      );
      setSpinning(false);
      announceWinner(selected.name);
    }, 4200);
  }

  const radius = 'min(37vw, calc((100dvh - 11rem) / 2 - 20px), 300px)';
  return (
    <div className="wheel-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="wheel-toolbar flex flex-wrap items-center justify-between gap-4 pb-4">
        <label
          htmlFor="wheel-group"
          className="wheel-group-picker flex min-w-0 items-center gap-3 text-sm font-semibold text-slate-700"
        >
          Grupa
          <select
            id="wheel-group"
            className="wheel-group-select min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            disabled={loading}
          >
            <option value="">Alege grupa</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <div className="text-sm text-slate-500">
          {children.length} {children.length === 1 ? 'copil' : 'copii'}
        </div>
      </div>
      {error && (
        <p role="alert" className="error-box mb-3">
          {error}
        </p>
      )}
      <section
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-visible p-1 sm:p-4"
      >
        <div
          className="relative z-0 aspect-square max-w-full shrink-0"
          style={{
            width: 'min(92vw, calc(100dvh - 11rem), 760px)',
            height: 'min(92vw, calc(100dvh - 11rem), 760px)',
          }}
        >
          <span
            className="wheel-winner-pointer absolute left-1/2 top-[-14px] z-[60] -translate-x-1/2 border-x-[18px] border-t-[34px] border-x-transparent border-t-amber-300 drop-shadow-lg"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-10 overflow-visible rounded-full border-8 border-white shadow-[0_14px_35px_rgba(0,0,0,0.35),inset_0_0_0_4px_rgba(30,89,71,0.25)] will-change-transform"
            style={{
              backgroundImage: wheelBackground,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 4.2s cubic-bezier(0.12, 0.8, 0.2, 1)'
                : 'none',
            }}
          >
            {children.map((child, index) => (
              <WheelPhoto
                key={child.id}
                child={child}
                angle={
                  index * (360 / children.length) + 360 / children.length / 2
                }
                radius={radius}
                wheelRotation={rotation}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Învârte roata"
            disabled={!groupId || !children.length || loading || spinning}
            onClick={spin}
            className="absolute left-1/2 top-1/2 z-40 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-rose-500 p-0 leading-none text-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-80 sm:h-28 sm:w-28"
          >
            {spinning ? (
              <LoaderCircle size={34} className="animate-spin" />
            ) : (
              <Play size={38} fill="currentColor" />
            )}
          </button>
        </div>
        <div className="mt-5 min-h-16 text-center text-white">
          {winner ? (
            <>
              <h1 className="text-3xl font-bold text-amber-200 sm:text-4xl">
                {winner.name}
              </h1>
              <p className="mt-1 flex items-center justify-center gap-2 text-white/80">
                <Volume2 size={16} />
                {winner.name} a fost {selectedLabel(winner.genre)}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/70">
              {groupId
                ? 'Apasă butonul din centru pentru a învârti roata.'
                : 'Alege o grupă pentru a începe.'}
            </p>
          )}
        </div>
      </section>
      {celebrationWinner && (
        <WinnerCelebration
          child={celebrationWinner}
          onClose={() => setCelebrationWinner(null)}
        />
      )}
    </div>
  );
}
