import React, { useState, useEffect, useRef } from 'react';
import { Bubble } from './components/Bubble';
import { TopicButton } from './components/TopicButton';
import { SourceChip } from './components/SourceChip';
import { fetchNews } from './services/geminiService';
import { BubbleState, NewsResult, QuickTopic, SavedArticle } from './types';

const QUICK_TOPICS: QuickTopic[] = [
  { id: 'tech', label: 'Tech', icon: '💻', query: 'Tecnología' },
  { id: 'world', label: 'Mundo', icon: '🌍', query: 'Noticias Internacionales' },
  { id: 'entertainment', label: 'Ocio', icon: '🎬', query: 'Entretenimiento y Espectáculos' },
  { id: 'sports', label: 'Deportes', icon: '⚽', query: 'Deportes' },
  { id: 'business', label: 'Negocios', icon: '📈', query: 'Negocios y Finanzas' },
  { id: 'science', label: 'Ciencia', icon: '🧬', query: 'Ciencia' },
];

const App: React.FC = () => {
  const [state, setState] = useState<BubbleState>(BubbleState.GREETING);
  const [news, setNews] = useState<NewsResult | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [greeting, setGreeting] = useState('Hola');
  const [selectedTopicDisplay, setSelectedTopicDisplay] = useState('');
  
  // Persistence
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>(() => {
    try {
      const saved = localStorage.getItem('daily_news_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved articles", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('daily_news_saved', JSON.stringify(savedArticles));
  }, [savedArticles]);
  
  // For the "typing" effect on results
  const [displayedText, setDisplayedText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  useEffect(() => {
    if (state === BubbleState.RESULT && news?.summary) {
      let index = 0;
      setDisplayedText('');
      const speed = 10; 

      const type = () => {
        if (index < news.summary.length) {
          setDisplayedText(prev => prev + news.summary.charAt(index));
          index++;
          typingTimeoutRef.current = setTimeout(type, speed);
        }
      };

      type();
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [state, news]);

  const handleTopicSelect = async (query: string) => {
    setState(BubbleState.LOADING);
    setSelectedTopicDisplay(query);
    try {
      const result = await fetchNews(query);
      setNews({ ...result, timestamp: 'Ahora mismo' });
      setState(BubbleState.RESULT);
    } catch (error) {
      console.error(error);
      setState(BubbleState.ERROR);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      handleTopicSelect(customTopic);
    }
  };

  const reset = () => {
    setState(BubbleState.GREETING);
    setNews(null);
    setCustomTopic('');
    setDisplayedText('');
  };

  const handleSaveArticle = () => {
    if (!news) return;
    
    // Check if already saved to prevent duplicates
    if (savedArticles.some(a => a.summary === news.summary && a.topic === selectedTopicDisplay)) {
      return;
    }

    const article: SavedArticle = {
      ...news,
      id: Date.now().toString(),
      topic: selectedTopicDisplay,
      // Spanish date format: 12 de octubre de 2023
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    setSavedArticles(prev => [article, ...prev]);
  };

  const handleDeleteArticle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleReadSaved = (article: SavedArticle) => {
    setSelectedTopicDisplay(article.topic);
    setNews({
      summary: article.summary,
      sources: article.sources,
      timestamp: `${article.date} • ${article.timestamp || ''}`
    });
    setState(BubbleState.RESULT);
  };

  const isCurrentArticleSaved = news && savedArticles.some(a => a.summary === news.summary);

  return (
    // Use 100dvh for mobile browsers to avoid address bar overlapping content
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative w-full overflow-hidden">
      
      {/* Background blobs for aesthetics */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <Bubble className="z-10 w-full max-w-lg">
        
        {/* Header / Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex items-center gap-3">
             {state === BubbleState.GREETING && (
              <button 
                onClick={() => setState(BubbleState.SAVED_LIST)}
                className="text-gray-400 hover:text-indigo-600 active:text-indigo-800 transition-colors p-2 -mr-2 touch-manipulation"
                title="Ver Artículos Guardados"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </button>
             )}
             <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest hidden sm:block">
               Resumen Diario
             </div>
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        {state === BubbleState.GREETING && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{greeting}!</h1>
              <p className="text-gray-600 text-sm sm:text-base">¿De qué te gustaría informarte hoy?</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {QUICK_TOPICS.map(topic => (
                <TopicButton key={topic.id} topic={topic} onClick={handleTopicSelect} />
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white/50 text-sm text-gray-400">o escribe un tema</span>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Cripto, Noticias locales..."
                className="flex-1 px-4 py-3 sm:py-2 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-gray-700 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!customTopic.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md shadow-indigo-200"
              >
                Ir
              </button>
            </form>
          </div>
        )}

        {state === BubbleState.SAVED_LIST && (
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-indigo-900">
               <button onClick={() => setState(BubbleState.GREETING)} className="hover:bg-black/5 active:bg-black/10 p-1 rounded-full transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
               <h2 className="text-xl font-bold">Resúmenes Guardados</h2>
             </div>
             
             {savedArticles.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                 <p>No hay artículos guardados.</p>
               </div>
             ) : (
               <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3 p-1">
                 {savedArticles.map(article => (
                   <div 
                      key={article.id} 
                      onClick={() => handleReadSaved(article)}
                      className="bg-white/60 hover:bg-white/90 active:scale-[0.98] p-4 rounded-xl border border-white/50 shadow-sm transition-all cursor-pointer group flex justify-between items-start touch-manipulation"
                   >
                     <div className="pr-4">
                       <h3 className="font-semibold text-gray-800 capitalize mb-1">{article.topic}</h3>
                       <p className="text-xs text-gray-500 mb-2">{article.date} • {article.sources.length} fuentes</p>
                       <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                     </div>
                     <button 
                       onClick={(e) => handleDeleteArticle(e, article.id)}
                       className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100"
                       title="Borrar"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
        )}

        {state === BubbleState.LOADING && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
             <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Expanding Rings Animation */}
                <div className="absolute w-full h-full bg-indigo-200/50 rounded-full animate-ripple"></div>
                <div className="absolute w-full h-full bg-indigo-200/50 rounded-full animate-ripple animate-ripple-delay"></div>
                
                {/* Floating Central Icon */}
                <div className="relative w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center z-10 animate-[float_3s_ease-in-out_infinite]">
                  <span className="text-3xl filter drop-shadow-md">🗞️</span>
                </div>
             </div>
             
             <div className="space-y-2">
               <p className="text-gray-800 font-semibold text-lg">
                 Buscando <span className="text-indigo-600 capitalize">"{selectedTopicDisplay}"</span>
               </p>
               <p className="text-sm text-gray-500 animate-pulse">Consultando fuentes...</p>
             </div>
          </div>
        )}

        {state === BubbleState.RESULT && news && (
          <div className="space-y-4">
             <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-bold text-gray-800 capitalize">Noticias de {selectedTopicDisplay}</h2>
                <span className="text-xs text-gray-400">{news.timestamp || 'Ahora mismo'}</span>
             </div>

             <div className="bg-white/40 rounded-2xl p-4 max-h-[40vh] overflow-y-auto custom-scrollbar border border-white/50">
               <div className="prose prose-sm prose-indigo text-gray-700 leading-relaxed whitespace-pre-wrap">
                 {displayedText}
               </div>
             </div>

             {news.sources.length > 0 && (
               <div className="pt-2">
                 <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Fuentes</p>
                 <div className="flex flex-wrap">
                   {news.sources.map((source, idx) => (
                     <SourceChip key={idx} source={source} />
                   ))}
                 </div>
               </div>
             )}

             <div className="flex gap-3 pt-2">
               <button 
                  onClick={reset}
                  className="flex-1 py-3 text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-xl transition-colors text-sm touch-manipulation"
               >
                 Volver
               </button>
               <button 
                  onClick={handleSaveArticle}
                  disabled={isCurrentArticleSaved}
                  className={`flex-1 py-3 font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2 touch-manipulation ${
                    isCurrentArticleSaved 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'bg-white border border-indigo-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 active:bg-gray-50'
                  }`}
               >
                 {isCurrentArticleSaved ? (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     Guardado
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                     Guardar
                   </>
                 )}
               </button>
             </div>
          </div>
        )}

        {state === BubbleState.ERROR && (
           <div className="py-10 text-center space-y-4">
             <div className="text-4xl">😕</div>
             <h3 className="text-lg font-bold text-gray-800">¡Vaya!</h3>
             <p className="text-gray-600">Algo salió mal al buscar las noticias.</p>
             <button 
                onClick={reset}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200"
             >
               Intentar de nuevo
             </button>
           </div>
        )}

      </Bubble>
    </div>
  );
};

export default App;