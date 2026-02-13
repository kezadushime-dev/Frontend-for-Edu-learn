type TrendPoint = {
  label: string;
  study: number;
  test: number;
};

type TrendChartProps = {
  title: string;
  subtitle?: string;
  points: TrendPoint[];
  studyLabel?: string;
  testLabel?: string;
};

type AssignmentItem = {
  title: string;
  dueIn: string;
  note?: string;
};

type AssignmentPanelProps = {
  title: string;
  items: AssignmentItem[];
};

type BreakdownItem = {
  label: string;
  value: number;
  tone?: 'blue' | 'emerald' | 'amber' | 'slate';
};

type StatusBreakdownChartProps = {
  title: string;
  subtitle?: string;
  items: BreakdownItem[];
};

type CalendarWidgetProps = {
  title?: string;
  highlightedDays?: number[];
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toPath = (
  points: TrendPoint[],
  width: number,
  height: number,
  padding: number,
  maxValue: number,
  key: 'study' | 'test'
): string => {
  if (!points.length) return '';
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  return points
    .map((point, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (point[key] / maxValue) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const toAreaPath = (
  points: TrendPoint[],
  width: number,
  height: number,
  padding: number,
  maxValue: number,
  key: 'study' | 'test'
): string => {
  if (!points.length) return '';
  const linePath = toPath(points, width, height, padding, maxValue, key);
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const firstX = padding;
  const lastX = padding + stepX * (points.length - 1);
  const baselineY = height - padding;
  return `${linePath} L${lastX.toFixed(2)} ${baselineY.toFixed(2)} L${firstX.toFixed(2)} ${baselineY.toFixed(2)} Z`;
};

const toCirclePoint = (
  value: number,
  index: number,
  count: number,
  width: number,
  height: number,
  padding: number,
  maxValue: number
) => {
  const stepX = count > 1 ? (width - padding * 2) / (count - 1) : 0;
  return {
    x: padding + index * stepX,
    y: height - padding - (value / maxValue) * (height - padding * 2)
  };
};

export function TrendChart({
  title,
  subtitle = 'Study Hours vs Test Hours',
  points,
  studyLabel = 'Study Hours',
  testLabel = 'Test Hours'
}: TrendChartProps) {
  const width = 680;
  const height = 260;
  const padding = 34;
  const maxValue = Math.max(
    10,
    ...points.flatMap((point) => [point.study, point.test])
  );

  const gridLevels = Array.from({ length: 5 }, (_, index) =>
    Math.round((maxValue / 4) * index)
  ).reverse();
  const studyPath = toPath(points, width, height, padding, maxValue, 'study');
  const testPath = toPath(points, width, height, padding, maxValue, 'test');
  const studyAreaPath = toAreaPath(points, width, height, padding, maxValue, 'study');
  const testAreaPath = toAreaPath(points, width, height, padding, maxValue, 'test');
  const totalStudy = points.reduce((sum, point) => sum + point.study, 0);
  const totalTest = points.reduce((sum, point) => sum + point.test, 0);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Study Statistics</p>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LegendPill tone="study" label={studyLabel} value={`${totalStudy}h`} />
            <LegendPill tone="test" label={testLabel} value={`${totalTest}h`} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color="bg-blue-600" label={studyLabel} />
          <LegendDot color="bg-amber-500" label={testLabel} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]">
          <defs>
            <linearGradient id="studyArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="testArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridLevels.map((level, index) => {
            const y = padding + ((height - padding * 2) / (gridLevels.length - 1)) * index;
            return (
              <g key={`grid-${level}`}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                <text x={8} y={y + 4} className="fill-slate-400 text-[10px]">
                  {level}
                </text>
              </g>
            );
          })}

          {studyAreaPath ? <path d={studyAreaPath} fill="url(#studyArea)" /> : null}
          {testAreaPath ? <path d={testAreaPath} fill="url(#testArea)" /> : null}
          <path d={studyPath} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
          <path d={testPath} fill="none" stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" />

          {points.map((point, index) => {
            const studyPoint = toCirclePoint(point.study, index, points.length, width, height, padding, maxValue);
            const testPoint = toCirclePoint(point.test, index, points.length, width, height, padding, maxValue);
            const xLabel = studyPoint.x;
            return (
              <g key={`point-${point.label}-${index}`}>
                <circle cx={studyPoint.x} cy={studyPoint.y} r={4.5} fill="#2563eb" stroke="white" strokeWidth={1.5} />
                <circle cx={testPoint.x} cy={testPoint.y} r={4.5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
                <text x={xLabel} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function CalendarWidget({ title = 'Calendar', highlightedDays = [] }: CalendarWidgetProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = Array.from({ length: firstDay }, (_, index) => `offset-${index}`);
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const highlightSet = new Set(highlightedDays);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <h3 className="text-xl font-bold text-slate-800 mt-1">{monthLabel}</h3>

      <div className="grid grid-cols-7 gap-1 mt-4 text-center text-[11px] text-slate-500 font-semibold">
        {dayNames.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2 text-sm">
        {offset.map((key) => (
          <span key={key} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const isToday = day === today;
          const isHighlighted = highlightSet.has(day);
          return (
            <span
              key={day}
              className={[
                'h-8 rounded-lg grid place-items-center',
                isToday ? 'bg-blue-600 text-white font-bold' : '',
                !isToday && isHighlighted ? 'bg-amber-100 text-amber-800 font-semibold' : '',
                !isToday && !isHighlighted ? 'text-slate-700 hover:bg-slate-100' : ''
              ].join(' ')}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function StatusBreakdownChart({ title, subtitle = 'Current distribution', items }: StatusBreakdownChartProps) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Breakdown</p>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>

      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const tone = toneClass(item.tone || 'slate');
          const width = `${Math.max(6, Math.round((item.value / maxValue) * 100))}%`;
          return (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="text-slate-500">{item.value}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white">
                <div className={`h-2.5 rounded-full ${tone}`} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AssignmentPanel({ title, items }: AssignmentPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Assignments</p>
      <h3 className="text-lg font-bold text-slate-800 mt-1">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={`${item.title}-${item.dueIn}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            <p className="text-xs text-slate-500 mt-1">Due in {item.dueIn}</p>
            {item.note ? <p className="text-xs text-slate-500 mt-1">{item.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function toneClass(tone: 'blue' | 'emerald' | 'amber' | 'slate') {
  if (tone === 'blue') return 'bg-blue-500';
  if (tone === 'emerald') return 'bg-emerald-500';
  if (tone === 'amber') return 'bg-amber-500';
  return 'bg-slate-500';
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function LegendPill({ tone, label, value }: { tone: 'study' | 'test'; label: string; value: string }) {
  const toneClass =
    tone === 'study'
      ? 'border-blue-100 bg-blue-50 text-blue-700'
      : 'border-amber-100 bg-amber-50 text-amber-700';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      <span>{label}</span>
      <span>{value}</span>
    </span>
  );
}

export type { TrendPoint, AssignmentItem, BreakdownItem };
