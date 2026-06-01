import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

dayjs.extend(customParseFormat);

// --- Sub-components for better performance (memoized) ---

const DayButton = React.memo(({ date, isCurrentMonth, isSelected, isToday, onClick }) => (
  <motion.button
    type="button"
    variants={{
      hidden: { opacity: 0, scale: 0.8 },
      show: { opacity: 1, scale: 1 }
    }}
    onClick={() => onClick(date)}
    className={`aspect-square flex items-center justify-center rounded-lg sm:rounded-xl text-[0.7rem] sm:text-xs font-bold transition-all relative ${
      !isCurrentMonth ? 'text-charcoal/20' : 'text-charcoal/80'
    } ${
      isSelected 
        ? 'bg-sage text-white shadow-lg shadow-sage/30 scale-110 z-10' 
        : 'hover:bg-sage/10 hover:text-sage-dark'
    }`}
  >
    {date.date()}
    {isToday && !isSelected && (
      <div className="absolute bottom-1 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-sage rounded-full" />
    )}
  </motion.button>
));

const YearButton = React.memo(({ year, isSelected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(year)}
    className={`py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[0.7rem] sm:text-[0.8rem] font-black transition-all ${
      isSelected 
        ? 'bg-charcoal text-white shadow-lg' 
        : 'hover:bg-charcoal/5 text-charcoal/60'
    }`}
  >
    {year}
  </button>
));

// --- Main Component ---

const ModernDatePicker = ({ label, value, onChange, error, icon: Icon, placeholder, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [mode, setMode] = useState('days'); // days, years
  
  // Internal view state
  const [viewDate, setViewDate] = useState(() => {
    const d = dayjs(value, 'DD-MM-YYYY');
    return d.isValid() ? d : dayjs();
  });

  // Sync viewDate when value changes externally
  useEffect(() => {
    const d = dayjs(value, 'DD-MM-YYYY');
    if (d.isValid()) setViewDate(d);
  }, [value]);

  // Click outside handler
  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const handleDateSelect = useCallback((date) => {
    onChange({ target: { name: name || 'dateOfBirth', value: date.format('DD-MM-YYYY') } });
    setIsOpen(false);
  }, [onChange, name]);

  const handleYearSelect = useCallback((year) => {
    setViewDate(prev => prev.year(year));
    setMode('days');
  }, []);

  // Memoized calendar logic
  const { days, years } = useMemo(() => {
    const startDay = viewDate.startOf('month').startOf('week');
    const calendarDays = Array.from({ length: 42 }).map((_, i) => startDay.add(i, 'day'));
    const calendarYears = Array.from({ length: 100 }).map((_, i) => dayjs().year() - i);
    return { days: calendarDays, years: calendarYears };
  }, [viewDate]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'years' ? 'days' : 'years');
  }, []);

  const changeMonth = useCallback((offset) => {
    setViewDate(prev => prev.add(offset, 'month'));
  }, []);

  return (
    <div className="space-y-2.5 relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[0.75rem] font-black uppercase tracking-wider text-charcoal/60 ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group/input cursor-pointer"
      >
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10 ${
            error ? 'text-red-500' : 'text-charcoal/30 group-focus-within/input:text-sage-dark'
          }`} />
        )}
        <div className={`w-full pl-12 pr-6 py-4 bg-white/60 border rounded-2xl outline-none transition-all duration-300 font-bold shadow-sm flex items-center min-h-[58px] ${
          error 
            ? 'border-red-300 focus:ring-red-100 focus:border-red-400 text-red-700' 
            : 'border-white/80 focus:ring-4 focus:ring-sage/10 focus:border-sage/50 text-charcoal'
        } ${isOpen ? 'ring-4 ring-sage/10 border-sage/50 shadow-md' : ''}`}>
          {value || <span className="text-charcoal/20 font-medium">{placeholder}</span>}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-500 pl-4 mt-1">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="absolute z-50 mt-2 w-[calc(100vw-2rem)] sm:w-80 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-4 sm:p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button 
                type="button"
                onClick={toggleMode}
                className="group/mode flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-charcoal/5 hover:bg-charcoal/10 transition-all active:scale-95"
              >
                <span className="text-[0.6rem] sm:text-[0.7rem] font-black uppercase tracking-widest text-charcoal/70">
                  {viewDate.format('MMMM YYYY')}
                </span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-charcoal/40 transition-transform duration-300 ${mode === 'years' ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-charcoal/5 transition-colors text-charcoal/40 hover:text-charcoal"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-charcoal/5 transition-colors text-charcoal/40 hover:text-charcoal"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {mode === 'days' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[0.55rem] sm:text-[0.6rem] font-black uppercase text-charcoal/30">{d}</div>
                  ))}
                </div>
                
                <motion.div 
                  variants={{
                    show: { transition: { staggerChildren: 0.005 } }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-7 gap-1"
                >
                  {days.map((date, i) => {
                    const isCurrentMonth = date.isSame(viewDate, 'month');
                    const isSelected = dayjs(value, 'DD-MM-YYYY').isSame(date, 'day');
                    const isToday = dayjs().isSame(date, 'day');

                    return (
                      <DayButton
                        key={date.valueOf()}
                        date={date}
                        isCurrentMonth={isCurrentMonth}
                        isSelected={isSelected}
                        isToday={isToday}
                        onClick={handleDateSelect}
                      />
                    );
                  })}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-48 sm:h-64 overflow-y-auto grid grid-cols-3 gap-2 pr-2 custom-scrollbar"
              >
                {years.map(y => (
                  <YearButton
                    key={y}
                    year={y}
                    isSelected={viewDate.year() === y}
                    onClick={handleYearSelect}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ModernDatePicker);
