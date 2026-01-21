import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, DollarSign, Calendar, ExternalLink, Settings2, Table as TableIcon, AlertCircle, Activity, Clock, ShieldCheck, Lock, Zap } from 'lucide-react';

function App() {
  // --- State: Core Financials ---
  const [cash, setCash] = useState<number>(50000);
  const [revenue, setRevenue] = useState<number>(5000);
  const [expenses, setExpenses] = useState<number>(5000);
  
  // --- Scenario State ---
  const [showScenarios, setShowScenarios] = useState<boolean>(false);
  const [growthRate, setGrowthRate] = useState<number>(5); 
  const [growthStartMonth, setGrowthStartMonth] = useState<number>(1);
  const [newHireCost, setNewHireCost] = useState<number>(2000);
  const [hireStartMonth, setHireStartMonth] = useState<number>(3);

  // --- UI State ---
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // --- The Logic Engine ---
  const { runwayMonths, deathDate, isProfitable, chartData } = useMemo(() => {
    let currentBalance = cash;
    let currentRevenue = revenue;
    
    const data = [];
    let zeroDateFound = false;
    let monthsUntilZero = Infinity;

    // UPGRADE: Changed loop from 24 to 36 months (3 Years)
    for (let i = 0; i <= 36; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      // UK Date Format for Chart Labels
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      const fullDate = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      const isActiveGrowth = showScenarios && i >= growthStartMonth;
      const isActiveHire = showScenarios && i >= hireStartMonth;

      if (isActiveGrowth) {
          currentRevenue = currentRevenue * (1 + (growthRate / 100));
      }

      const currentTotalExpenses = expenses + (isActiveHire ? newHireCost : 0);
      const currentNet = currentRevenue - currentTotalExpenses;

      data.push({ 
        id: i,
        name: label, 
        fullDate: fullDate,
        balance: Math.round(currentBalance),
        revenue: Math.round(currentRevenue),
        expenses: Math.round(currentTotalExpenses),
        net: Math.round(currentNet),
        isProjected: isActiveGrowth || isActiveHire
      });

      if (currentBalance <= 0 && !zeroDateFound) {
        const prevBalance = data[i-1]?.balance || cash;
        const burnRate = prevBalance - currentBalance;
        const fraction = burnRate !== 0 ? prevBalance / burnRate : 0;
        monthsUntilZero = (i - 1) + fraction;
        zeroDateFound = true;
      }

      currentBalance += currentNet;
    }

    const today = new Date();
    const daysToAdd = Math.floor((zeroDateFound ? monthsUntilZero : 0) * 30.44); 
    const deathDateObj = new Date(today.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    // UK Date Format for "Death Date"
    const deathDateStr = !zeroDateFound ? "Indefinite Runway" : deathDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return { 
      runwayMonths: zeroDateFound ? monthsUntilZero : Infinity, 
      deathDate: deathDateStr, 
      isProfitable: !zeroDateFound,
      chartData: data
    };
  }, [cash, revenue, expenses, growthRate, growthStartMonth, newHireCost, hireStartMonth, showScenarios]);

  const getAdvice = () => {
    // If Profitable (Revenue >= Expenses at start OR calculates as profitable)
    if (revenue >= expenses) return {
      borderColor: "border-finance-green/30",
      bgGradient: "from-finance-green/10 to-transparent",
      iconColor: "text-finance-green",
      title: "Profitable & Growing 🚀",
      text: "You are generating surplus capital. The question now shifts from 'survival' to 'strategy'. Are you deploying these funds efficiently?",
      cta: "Optimise Capital Allocation"
    };
    if (runwayMonths > 12) return {
      borderColor: "border-finance-blue/30",
      bgGradient: "from-finance-blue/10 to-transparent",
      iconColor: "text-finance-blue",
      title: "Healthy Runway 🛡️",
      text: "You have time to correct course, but don't get complacent. Use this buffer to test new revenue channels without the pressure of a crisis.",
      cta: "Review Strategic Options"
    };
    if (runwayMonths > 5) return {
      borderColor: "border-yellow-500/30",
      bgGradient: "from-yellow-500/10 to-transparent",
      iconColor: "text-yellow-500",
      title: "Caution Zone ⚠️",
      text: "You have less than a year. If revenue doesn't pick up soon, you will need to make difficult cuts. Now is the time to plan, not hope.",
      cta: "Get a Cash Flow Audit"
    };
    return {
      borderColor: "border-finance-red/30",
      bgGradient: "from-finance-red/10 to-transparent",
      iconColor: "text-finance-red",
      title: "Critical Action Required 🚨",
      text: "Clarity beats anxiety. Your runway is dangerously short, but you have options. We need to structure a survival plan immediately.",
      cta: "Get Strategic Guidance"
    };
  };

  const advice = getAdvice();

  return (
    <div className="min-h-screen bg-finance-bg p-6 md:p-12 flex flex-col items-center font-sans">
      
      {/* Header */}
      <header className="max-w-5xl w-full flex justify-between items-end mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">Runway<span className="text-finance-blue">.Visualiser</span></h1>
          <p className="text-slate-400">Privacy-first cash flow modelling. No bank connections.</p>
        </div>
        <div className="hidden md:block text-right">
           <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Built by</div>
           <a href="https://sheridanjamieson.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-finance-blue transition-colors">Sheridan Jamieson</a>
        </div>
      </header>

      <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-finance-card p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Core Financials
            </h2>
            <div className="space-y-5">
              <div className="group">
                <label className="block text-xs text-slate-500 mb-1 group-focus-within:text-finance-blue transition-colors">Current Cash</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" value={cash} onChange={(e) => setCash(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-finance-blue transition-colors font-mono text-lg" />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs text-slate-500 mb-1 group-focus-within:text-finance-green transition-colors">Monthly Revenue</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-finance-green transition-colors font-mono text-lg" />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs text-slate-500 mb-1 group-focus-within:text-finance-red transition-colors">Monthly Expenses</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-finance-red transition-colors font-mono text-lg" />
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setShowScenarios(!showScenarios)} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${showScenarios ? 'bg-slate-800 border-finance-blue text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
            <div className="flex items-center gap-3">
               <Settings2 className="w-5 h-5" />
               <span className="text-sm font-semibold">Enable Forecasting</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${showScenarios ? 'bg-finance-blue' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showScenarios ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>

          {showScenarios && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-finance-blue/30 animate-in slide-in-from-top-4 fade-in duration-300">
               <h2 className="text-xs uppercase tracking-wider text-finance-blue font-semibold mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Growth Scenarios</h2>
               <div className="space-y-6">
                  <div className="group">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs text-slate-400">Monthly Growth %</label>
                        <div className="flex items-center gap-1 text-[10px] text-finance-blue"><Clock className="w-3 h-3" /><span>Starts Month {growthStartMonth}</span></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <input type="number" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} className={`w-full bg-slate-950 border rounded-lg py-2 pl-4 pr-8 text-white focus:outline-none transition-colors font-mono ${growthRate > 5 ? 'border-yellow-500 focus:border-yellow-500' : 'border-slate-800 focus:border-finance-blue'}`} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                        </div>
                        <input type="number" min="1" max="36" value={growthStartMonth} onChange={(e) => setGrowthStartMonth(Number(e.target.value))} className="w-16 bg-slate-950 border border-slate-800 rounded-lg py-2 text-center text-white focus:outline-none focus:border-finance-blue font-mono" />
                    </div>
                    {growthRate > 5 && (
                       <div className="mt-2 flex gap-2 text-[10px] text-yellow-500 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                          <AlertCircle className="w-3 h-3 shrink-0" /><p>Aggressive growth (doubles every {Math.round(72/growthRate)}mo).</p>
                       </div>
                    )}
                  </div>
                  <div className="group">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs text-slate-400">New Monthly Cost</label>
                        <div className="flex items-center gap-1 text-[10px] text-finance-blue"><Clock className="w-3 h-3" /><span>Starts Month {hireStartMonth}</span></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input type="number" value={newHireCost} onChange={(e) => setNewHireCost(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-6 pr-4 text-white focus:outline-none focus:border-finance-blue transition-colors font-mono" />
                        </div>
                        <input type="number" min="1" max="36" value={hireStartMonth} onChange={(e) => setHireStartMonth(Number(e.target.value))} className="w-16 bg-slate-950 border border-slate-800 rounded-lg py-2 text-center text-white focus:outline-none focus:border-finance-blue font-mono" />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-finance-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="space-y-1">
                 <div className="text-sm text-slate-400 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Zero Cash Date</div>
                 
                 {/* --- SMARTER LOGIC STARTS HERE --- */}
                 {revenue >= expenses ? (
                    // CASE 1: Profitable
                    <>
                       <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">Indefinite</div>
                       <div className="text-finance-green font-medium mt-2 flex items-center gap-2 text-sm">
                         <TrendingUp className="w-4 h-4" /> Profitable & Growing
                       </div>
                    </>
                 ) : runwayMonths > 36 ? (
                    // CASE 2: Burning but Long Runway
                    <>
                       <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">3+ Years</div>
                       <div className="text-slate-400 font-medium mt-2 text-sm">
                         (Runway exceeds chart limits)
                       </div>
                    </>
                 ) : (
                    // CASE 3: Standard Date
                    <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">{deathDate}</div>
                 )}
                 {/* --- SMARTER LOGIC ENDS HERE --- */}
                 
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-1">Runway</div>
                <div className={`text-4xl font-mono font-bold ${runwayMonths < 6 && runwayMonths !== Infinity ? 'text-finance-red' : 'text-white'}`}>
                  {runwayMonths === Infinity || runwayMonths > 36 ? '∞' : runwayMonths.toFixed(1)} <span className="text-lg text-slate-500 font-sans font-normal">Months</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-finance-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
             <div className="p-2 bg-slate-900 border-b border-white/5">
                <div className="flex bg-slate-800/50 p-1 rounded-xl">
                    <button onClick={() => setViewMode('chart')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'chart' ? 'bg-finance-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <Activity className="w-4 h-4" /> Forecast Chart
                    </button>
                    <button onClick={() => setViewMode('table')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-finance-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <TableIcon className="w-4 h-4" /> Data Table
                    </button>
                </div>
             </div>
             <div className="flex-grow min-h-0 relative"> 
                {viewMode === 'table' ? (
                  <div className="absolute inset-0 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-slate-900 sticky top-0 text-xs uppercase tracking-wider text-slate-500 font-semibold z-10">
                          <tr>
                             <th className="p-4">Month</th><th className="p-4 text-right">Revenue</th><th className="p-4 text-right">Expenses</th><th className="p-4 text-right">Net Flow</th><th className="p-4 text-right">Balance</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                          {chartData.map((row) => (
                             <tr key={row.name} className={`hover:bg-slate-800/50 transition-colors ${row.isProjected ? 'bg-finance-blue/5' : ''}`}>
                                <td className="p-4 font-sans text-white flex items-center gap-2">{row.fullDate}{row.isProjected && <div className="w-1.5 h-1.5 rounded-full bg-finance-blue" title="Forecast Active"></div>}</td>
                                <td className="p-4 text-right text-finance-green">+${row.revenue.toLocaleString()}</td>
                                <td className="p-4 text-right text-finance-red">-${row.expenses.toLocaleString()}</td>
                                <td className={`p-4 text-right font-bold ${row.net >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>{row.net >= 0 ? '+' : ''}{row.net.toLocaleString()}</td>
                                <td className={`p-4 text-right font-bold ${row.balance < 0 ? 'text-finance-red' : 'text-white'}`}>${row.balance.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={isProfitable ? "#10b981" : "#3b82f6"} stopOpacity={0.3}/><stop offset="95%" stopColor={isProfitable ? "#10b981" : "#3b82f6"} stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']} />
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="balance" stroke={isProfitable ? "#10b981" : "#3b82f6"} strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
             </div>
          </div>

          <a href="https://nurture.kiwi" target="_blank" rel="noopener noreferrer" className="block group">
            <div className={`bg-gradient-to-r ${advice.bgGradient} border ${advice.borderColor} p-8 rounded-2xl hover:border-white/20 transition-all flex items-start gap-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className={`p-3 rounded-xl bg-slate-950/50 backdrop-blur border border-white/10 ${advice.iconColor} shrink-0`}><TrendingUp className="w-6 h-6" /></div>
              <div className="flex-grow z-10">
                <h3 className={`font-bold text-lg mb-2 ${advice.iconColor}`}>{advice.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-xl">{advice.text}</p>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-finance-blue transition-colors">{advice.cta} <ExternalLink className="w-4 h-4" /></div>
              </div>
            </div>
          </a>
        </div>
      </main>

      {/* METHODOLOGY & FAQ SECTION - Static Grid (No Jumps) */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 md:p-10 shadow-xl">
          
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl font-bold text-white">Methodology & FAQ</h2>
            <p className="text-slate-400">How we protect your data and calculate your runway.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Privacy (Most Important) */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-6 hover:border-blue-500/30 transition-colors">
              <h3 className="text-slate-200 font-bold mb-3">Is my financial data safe?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong>Yes. YourBudget is "Local-First".</strong> We do not have a database. The numbers you type live only in your browser's local memory (Local Storage). We cannot see, store, or share your data even if we wanted to.
              </p>
            </div>

            {/* Card 2: Net Burn */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-6 hover:border-blue-500/30 transition-colors">
              <h3 className="text-slate-200 font-bold mb-3">How do I calculate Net Burn Rate?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Net Burn Rate is the actual cash you lose each month. It captures all expenses minus any incoming revenue.
              </p>
              <code className="block mt-3 text-xs bg-black/30 p-2 rounded text-blue-300 font-mono text-center border border-white/5">
                (Start Cash) - (End Cash)
              </code>
            </div>

            {/* Card 3: Zero Cash Date */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-6 hover:border-blue-500/30 transition-colors">
              <h3 className="text-slate-200 font-bold mb-3">What is a "Zero Cash Date"?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your Zero Cash Date is the estimated calendar day your startup will run out of money. Investors typically expect you to start fundraising <strong>6-9 months</strong> before this date hits to avoid leverage loss.
              </p>
            </div>

            {/* Card 4: Runway */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-6 hover:border-blue-500/30 transition-colors">
              <h3 className="text-slate-200 font-bold mb-3">How much runway should I have?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Standard advice is <strong>18 to 24 months</strong> after a fresh funding round. If you drop below 6 months of runway, you are in the "Danger Zone" where fundraising becomes exponentially harder.
              </p>
            </div>

          </div>
        </div>
      </section>

    {/* FOOTER & SEO CONTENT (Trust Signals) */}
      <footer className="border-t border-white/5 bg-slate-900/50 py-12">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-finance-green" /> Privacy First</h3>
                <p className="text-sm text-slate-400">All data stays in your browser. No databases, no bank connections, no tracking.</p>
            </div>
            <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-finance-blue" /> Instant Answers</h3>
                <p className="text-sm text-slate-400">No sign-up required. Get immediate clarity on your burn rate and runway.</p>
            </div>
            <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-yellow-500" /> CFO Grade</h3>
                <p className="text-sm text-slate-400">Built by a Virtual CFO to help founders make better strategic decisions.</p>
            </div>
        </div>
        
        {/* UPDATED COPYRIGHT LINE */}
        <div className="text-center text-slate-600 text-xs uppercase tracking-widest flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
           <span>&copy; {new Date().getFullYear()} YourBudget.</span>
           <span>
             Strategic Finance by <a href="https://nurture.kiwi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold">Nurture</a>.
           </span>
        </div>
      </footer>
    </div> 
  );
}

export default App;
