import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for our events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'class' | 'meeting' | 'exam' | 'deadline';
  status: 'pending' | 'completed' | 'urgent';
  description?: string;
}

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dummy Data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Advanced Web Architecture',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 10, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 12, 0),
      type: 'class',
      status: 'completed',
      description: 'Room 402 - Main Building'
    },
    {
      id: '2',
      title: 'Faculty Meeting',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 14, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 15, 30),
      type: 'meeting',
      status: 'pending',
      description: 'Virtual Meeting via Zoom'
    },
    {
      id: '3',
      title: 'Mid-term Data Structures',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 9, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 12, 0),
      type: 'exam',
      status: 'urgent',
      description: 'Grand Hall'
    },
    {
      id: '4',
      title: 'Project Submission',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 23, 59),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 23, 59),
      type: 'deadline',
      status: 'urgent'
    }
  ];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 bg-white/50 backdrop-blur-xl border-b border-white/20 rounded-t-[2rem]">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Manage your academic schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={goToToday}
            className="px-6 font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-300"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search schedule..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 shadow-sm"
            />
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {days.map((day) => (
          <div key={day} className="py-4 text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = events.filter(e => isSameDay(e.start, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative min-h-[140px] p-2 border-r border-b border-gray-100 transition-all duration-300 group hover:bg-indigo-50/30",
              !isSameMonth(day, monthStart) ? "bg-gray-50/30 text-gray-300" : "text-gray-700",
              isSameDay(day, selectedDate) ? "bg-indigo-50/50" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={cn(
                "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
                isToday(day)
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110"
                  : isSameDay(day, selectedDate)
                    ? "bg-indigo-100 text-indigo-700"
                    : "group-hover:bg-gray-100"
              )}>
                {formattedDate}
              </span>
              {dayEvents.length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </div>

            <div className="space-y-1.5">
              {dayEvents.map((event) => (
                <TooltipProvider key={event.id}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div
                          className={cn(
                            "px-2 py-1.5 rounded-lg text-[10px] font-bold leading-tight truncate cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm",
                            event.type === 'class' ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              event.type === 'meeting' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                event.type === 'exam' ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                  "bg-amber-50 text-amber-700 border border-amber-100"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-1 h-1 rounded-full",
                              event.type === 'class' ? "bg-blue-400" :
                                event.type === 'meeting' ? "bg-emerald-400" :
                                  event.type === 'exam' ? "bg-rose-400" :
                                    "bg-amber-400"
                            )} />
                            {event.title}
                          </div>
                        </div>
                      }
                    />
                    <TooltipContent side="right" className="p-3 max-w-xs bg-white border border-gray-200 shadow-xl rounded-xl">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {event.type}
                          </Badge>
                          {event.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : event.status === 'urgent' ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                          ) : null}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                        {event.description && (
                          <p className="text-[11px] text-gray-500 italic border-t pt-2">{event.description}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-md">
              <Plus className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white">{rows}</div>;
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm border border-white/40">
        {renderHeader()}
        <div className="p-0">
          {renderDays()}
          {renderCells()}
        </div>
      </Card>

      {/* Quick Stats / Info Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] border-none shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">Next Up</p>
              <h3 className="text-xl font-bold">Faculty Meeting</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Time: 14:00 PM</span>
              <Badge className="bg-white/20 hover:bg-white/30 border-none">15 min left</Badge>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3 rounded-full" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Weekly Progress</h3>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="175" strokeDashoffset="44" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600">75%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">3 of 4 Tasks Done</p>
              <p className="text-xs text-gray-500">Keep it up! You're almost there.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Quick Filters</h3>
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['Classes', 'Exams', 'Meetings', 'Deadlines'].map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="px-4 py-1.5 rounded-xl border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer text-gray-600"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export { SchedulePage };
