import React, { useState, useRef } from 'react';
import { Post } from '../types';

interface CalendarViewProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onSelectPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredPost, setHoveredPost] = useState<{ post: Post; rect: DOMRect } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const postsByDate: { [key: string]: Post[] } = {};
  posts.forEach(post => {
    const date = new Date(post.scheduledAt).toDateString();
    if (!postsByDate[date]) {
      postsByDate[date] = [];
    }
    postsByDate[date].push(post);
  });

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, post: Post) => {
    if (post.media && post.media.length > 0) {
      setHoveredPost({ post, rect: e.currentTarget.getBoundingClientRect() });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPost(null);
  };
  
  const getTooltipStyle = (): React.CSSProperties => {
    if (!hoveredPost || !calendarRef.current) return { opacity: 0, pointerEvents: 'none' };
    
    const { rect } = hoveredPost;
    const calendarRect = calendarRef.current.getBoundingClientRect();

    const tooltipHeight = 128; // h-32
    const tooltipWidth = 128; // w-32
    const margin = 10;
    
    let top = rect.top - tooltipHeight - margin;
    if (top < calendarRect.top) {
        top = rect.bottom + margin;
    }

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(calendarRect.left, left);
    left = Math.min(left, calendarRect.right - tooltipWidth - margin);

    return {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        transition: 'opacity 0.2s ease-in-out',
    };
  }


  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div ref={calendarRef} className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-center text-brand-primary">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {weekdays.map(weekday => <div key={weekday}>{weekday}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d, i) => {
          const dateStr = d.toDateString();
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const isToday = d.toDateString() === new Date().toDateString();
          const postsForDay = postsByDate[dateStr] || [];

          return (
            <div
              key={i}
              className={`relative p-1 sm:p-2 border-t dark:border-dark-border h-20 sm:h-32 flex flex-col ${isCurrentMonth ? 'bg-white dark:bg-dark-card' : 'bg-gray-50 dark:bg-gray-800'}`}
            >
              <div className={`absolute top-1 right-1 text-xs sm:text-sm font-medium ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''} ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                {d.getDate()}
              </div>
              <div className="w-full h-full flex items-center justify-center">
                {postsForDay.length > 0 && (() => {
                    const firstPost = postsForDay[0];
                    const firstMedia = firstPost.media[0];
                    let icon = (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    ); // Default text icon

                    if (firstMedia?.type.startsWith('image/')) {
                        icon = <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
                    } else if (firstMedia?.type.startsWith('video/')) {
                        icon = <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>;
                    }
                    
                    return (
                        <div
                            onClick={() => onSelectPost(firstPost)}
                            onMouseEnter={(e) => handleMouseEnter(e, firstPost)}
                            onMouseLeave={handleMouseLeave}
                            className="w-full h-full flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer transition-colors"
                        >
                            {icon}
                        </div>
                    );
                })()}
              </div>
            </div>
          );
        })}
      </div>

        {hoveredPost && hoveredPost.post.media[0] && (
            <div
                style={getTooltipStyle()}
                className="w-32 h-32 bg-white dark:bg-dark-card p-1 rounded-lg shadow-2xl border dark:border-dark-border z-30 pointer-events-none"
            >
                {hoveredPost.post.media[0].type.startsWith('image/') ? (
                    <img src={hoveredPost.post.media[0].url} alt="preview" className="w-full h-full object-cover rounded"/>
                ) : (
                    <video src={hoveredPost.post.media[0].url} className="w-full h-full object-cover rounded" autoPlay muted loop />
                )}
            </div>
        )}
    </div>
  );
};

export default CalendarView;
