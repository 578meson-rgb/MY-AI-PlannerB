
import React, { useState, useMemo, useEffect } from 'react';
import { SYLLABUS } from './constants';
import { ConfidenceLevel, UserPlanRequest } from './types';
import { generateStudyPlan } from './geminiService';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award,
  ListTodo,
  ArrowLeft,
  Download,
  AlertTriangle,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeSubjectId, setActiveSubjectId] = useState(SYLLABUS[0].id);
  const [activePaper, setActivePaper] = useState<'first' | 'second'>('first');
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>({});
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!examDate) {
      const today = new Date();
      const defaultDate = new Date(today);
      defaultDate.setDate(today.getDate() + 30);
      setExamDate(defaultDate.toISOString().split('T')[0]);
    }
  }, []);

  const paperKey = `${activeSubjectId}-${activePaper}`;

  const handleChapterToggle = (chapterName: string) => {
    setSelectedChapters(prev => {
      const current = prev[paperKey] || [];
      const updated = current.includes(chapterName)
        ? current.filter(c => c !== chapterName)
        : [...current, chapterName];
      return { ...prev, [paperKey]: updated };
    });
  };

  const totalSelectedChaptersCount = useMemo(() => {
    return Object.values(selectedChapters).reduce((acc: number, curr: any) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  }, [selectedChapters]);

  const handleSubmit = async () => {
    if (!examDate) {
      alert("Please select your exam date.");
      return;
    }
    if (totalSelectedChaptersCount === 0) {
      alert("Please select at least one chapter.");
      return;
    }

    setLoading(true);
    try {
      const formattedChapters: UserPlanRequest['selectedChapters'] = [];
      (Object.entries(selectedChapters) as [string, string[]][]).forEach(([key, names]) => {
        if (Array.isArray(names) && names.length > 0) {
          const [subjId, paper] = key.split('-') as [string, 'first' | 'second'];
          formattedChapters.push({ subjectId: subjId, paper, chapterNames: names });
        }
      });

      const response = await generateStudyPlan({
        selectedChapters: formattedChapters,
        examDate,
        dailyHours,
        confidence
      });
      setPlan(response);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const parsePlanIntoSections = (text: string) => {
    const sections: { title: string; content: string; icon: any }[] = [];
    const rawSections = text.split(/\n(?=📅|⏳|🗓️|🔁|🌱|⚠️|🎯)/);
    
    rawSections.forEach(s => {
      const trimmed = s.trim();
      if (!trimmed) return;
      
      let icon = ListTodo;
      if (trimmed.startsWith('📅')) icon = Calendar;
      if (trimmed.startsWith('⏳')) icon = Clock;
      if (trimmed.startsWith('🗓️')) icon = ListTodo;
      if (trimmed.startsWith('🔁')) icon = RefreshCw;
      if (trimmed.startsWith('🌱')) icon = Sparkles;
      if (trimmed.startsWith('⚠️')) icon = AlertTriangle;
      if (trimmed.startsWith('🎯')) icon = Target;

      const lines = trimmed.split('\n');
      const title = lines[0].replace(/[📅⏳🗓️🔁🌱⚠️🎯]/g, '').trim();
      const content = lines.slice(1).join('\n').trim();
      
      sections.push({ title, content, icon });
    });
    
    return sections;
  };

  const renderSubjectIcon = (id: string, className: string = "w-6 h-6") => {
    switch (id) {
      case 'math': return <Calculator className={className} />;
      case 'physics': return <Atom className={className} />;
      case 'chemistry': return <FlaskConical className={className} />;
      case 'biology': return <Dna className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const renderSelectionStep = () => {
    const activePaperData = SYLLABUS.find(s => s.id === activeSubjectId)?.papers[activePaper];

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fadeIn">
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)]">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">CarePlan</h1>
            <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
              The realistic, stress-free study planner. We help you stay focused, avoid burnout, and crush your exams.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-3 text-indigo-900">
              <ListTodo className="w-5 h-5" />
              <h2 className="text-xl font-bold">Select Your Syllabus</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SYLLABUS.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubjectId(subj.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all border-2 ${
                    activeSubjectId === subj.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                  }`}
                >
                  {renderSubjectIcon(subj.id, `w-7 h-7 ${activeSubjectId === subj.id ? 'text-indigo-600' : 'text-slate-400'}`)}
                  <span className="font-semibold">{subj.name}</span>
                </button>
              ))}
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl max-w-md mx-auto">
              {(['first', 'second'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setActivePaper(p)}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    activePaper === p
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p === 'first' ? '1st Paper' : '2nd Paper'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activePaperData?.chapters.map(ch => (
                <label
                  key={ch.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    (selectedChapters[paperKey] || []).includes(ch.name)
                      ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={(selectedChapters[paperKey] || []).includes(ch.name)}
                      onChange={() => handleChapterToggle(ch.name)}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                  </div>
                  <span className="bangla-text font-medium text-slate-700">{ch.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-50/80 p-8 border-t border-slate-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Calendar className="w-4 h-4" /> Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Clock className="w-4 h-4" /> Study Hours
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {[2, 4, 6, 8, 10, 12].map(h => (
                    <option key={h} value={h}>{h} Hours / day</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Award className="w-4 h-4" /> Confidence
                </label>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || totalSelectedChaptersCount === 0}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-tight transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 ${
                loading || totalSelectedChaptersCount === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Creating Personalized Plan...
                </>
              ) : (
                <>
                  Generate My Smart Plan
                  <Sparkles className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanStep = () => {
    const sections = parsePlanIntoSections(plan || '');

    return (
      <div className="max-w-4xl mx-auto p-0 pb-12 animate-fadeIn print:m-0 print:max-w-none">
        {/* Navigation - Hidden in print */}
        <div className="max-w-4xl mx-auto p-6 flex items-center justify-between no-print">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-slate-600 font-bold hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Selection
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
        </div>

        {/* Personalized Banner */}
        <div className="bg-indigo-600 text-white p-12 text-center space-y-4 rounded-b-[3rem] shadow-xl relative overflow-hidden print:rounded-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-2">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Personalized Study Plan</h1>
          <p className="text-indigo-100 font-medium">Crafted with care by CarePlan Assistant</p>
          <div className="flex items-center justify-center gap-6 text-sm text-indigo-50 pt-2">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {examDate}</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Exam Ready</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-8 space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 text-slate-800">
                <span className="text-2xl">{idx + 1 === 1 ? '📅' : idx + 1 === 2 ? '⏳' : idx + 1 === 3 ? '🗓️' : idx + 1 === 4 ? '🔁' : idx + 1 === 5 ? '🌱' : idx + 1 === 6 ? '⚠️' : '🎯'}</span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{section.title}:</h3>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/60 leading-relaxed text-slate-700">
                <div className="bangla-text text-[1.1rem] whitespace-pre-wrap">
                  {/* Custom formatting for Daily Study Plan items */}
                  {section.title.toLowerCase().includes('daily study plan') ? (
                    <div className="space-y-6">
                      {section.content.split('\n').map((line, lIdx) => {
                        if (line.trim().startsWith('Day')) {
                          const parts = line.split(':');
                          const dayNum = parts[0];
                          const rest = parts.slice(1).join(':');
                          
                          // Look for topic pattern "Day X: **Topic** (Subject) (Time) - Description"
                          return (
                            <div key={lIdx} className="pb-4 border-b border-slate-100 last:border-0">
                               <span className="text-indigo-600 font-bold block mb-1 text-lg">{dayNum}:</span>
                               <span className="text-slate-900 font-bold bangla-text">{rest}</span>
                            </div>
                          );
                        }
                        return <div key={lIdx} className="text-slate-600">{line}</div>;
                      })}
                    </div>
                  ) : (
                    section.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Professional Footer */}
          <div className="bg-slate-100/50 rounded-2xl p-8 text-center text-slate-400 font-medium text-sm space-y-1 border border-slate-200/50">
            <p>Generated by CarePlan • Your Education, Our Priority</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {step === 1 ? renderSelectionStep() : renderPlanStep()}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
