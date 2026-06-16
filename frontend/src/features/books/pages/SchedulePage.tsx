import { useState } from "react";
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
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// Types for our events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "class" | "meeting" | "exam" | "deadline";
  status: "pending" | "completed" | "urgent";
  description?: string;
}

const SchedulePage = () => {
  usePageTitle("Schedule");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Dummy Data
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Advanced Web Architecture",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        12,
        10,
        0,
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        12,
        12,
        0,
      ),
      type: "class",
      status: "completed",
      description: "Room 402 - Main Building",
    },
    {
      id: "2",
      title: "Faculty Meeting",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        12,
        14,
        0,
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        12,
        15,
        30,
      ),
      type: "meeting",
      status: "pending",
      description: "Virtual Meeting via Zoom",
    },
    {
      id: "3",
      title: "Mid-term Data Structures",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        15,
        9,
        0,
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        15,
        12,
        0,
      ),
      type: "exam",
      status: "urgent",
      description: "Grand Hall",
    },
    {
      id: "4",
      title: "Project Submission",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        20,
        23,
        59,
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        20,
        23,
        59,
      ),
      type: "deadline",
      status: "urgent",
    },
  ];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventColors = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "class":
        return {
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-blue-700",
          dot: "bg-blue-500",
        };
      case "meeting":
        return {
          bg: "bg-success-bg",
          border: "border-success-bg",
          text: "text-success-text",
          dot: "bg-success-bg0",
        };
      case "exam":
        return {
          bg: "bg-error-bg",
          border: "border-error-bg",
          text: "text-error-text",
          dot: "bg-error-bg0",
        };
      case "deadline":
        return {
          bg: "bg-warning-bg",
          border: "border-warning-bg",
          text: "text-warning-text",
          dot: "bg-warning-bg0",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-100",
          text: "text-gray-700",
          dot: "bg-gray-500",
        };
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col items-start justify-between rounded-t-3xl border-b border-white/20 bg-white/50 p-4 backdrop-blur-xl md:flex-row md:items-center md:px-6 md:py-6">
        <div className="mb-4 flex items-center gap-4 md:mb-0">
          <div className="rounded-2xl bg-blue-600 p-2.5 shadow-lg shadow-blue-200 md:p-3">
            <CalendarIcon className="h-5 w-5 text-white md:h-6 md:w-6" />
          </div>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger
              render={
                <button className="flex flex-col items-start text-left transition-opacity hover:opacity-80">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl leading-tight font-bold text-gray-900 md:text-2xl">
                      {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 md:text-sm">
                    Manage your academic schedule
                  </p>
                </button>
              }
            />

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={currentDate}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(date);
                    setSelectedDate(date);
                    setIsDatePickerOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-6">
          {/* Pagination Controls */}
          <div className="flex items-center justify-between gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm md:justify-center md:p-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-9 w-9 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 md:h-10 md:w-10"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={goToToday}
              className="h-9 rounded-xl px-4 text-xs font-bold text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 md:h-10 md:px-6 md:text-sm"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-9 w-9 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 md:h-10 md:w-10"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          {/* Search & Add */}
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="group relative flex-1 md:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            <Button className="h-10 shrink-0 gap-2 rounded-xl bg-blue-600 px-4 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 md:px-5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {days.map((day) => (
          <div key={day} className="py-2 text-center md:py-4">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase md:text-xs">
              {isMobile ? day.charAt(0) : day}
            </span>
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
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = events.filter((e) => isSameDay(e.start, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-start border-r border-b border-gray-100 p-1 transition-all duration-300 hover:bg-blue-50/30 md:items-start md:p-2",
              isMobile ? "h-16" : "min-h-[130px] xl:min-h-[140px]",
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/30 text-gray-300"
                : "text-gray-700",
              isSameDay(day, selectedDate) ? "bg-blue-50/50" : "",
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex w-full items-center justify-center md:mb-2 md:justify-between md:px-1">
              <span
                className={cn(
                  "flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 md:text-sm",
                  isMobile ? "mt-1 h-7 w-7" : "h-8 w-8",
                  isToday(day)
                    ? "scale-110 bg-blue-600 text-white shadow-md shadow-blue-200"
                    : isSameDay(day, selectedDate)
                      ? "bg-blue-100 text-blue-700"
                      : "group-hover:bg-gray-100",
                )}
              >
                {formattedDate}
              </span>
              {!isMobile && dayEvents.length > 0 && (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              )}
            </div>

            {/* Mobile: Dots Indicator */}
            {isMobile && dayEvents.length > 0 && (
              <div className="mt-1 flex gap-0.5">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      getEventColors(event.type).dot,
                    )}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
              </div>
            )}

            {/* Desktop: Event Badges */}
            {!isMobile && (
              <div className="w-full space-y-1.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const colors = getEventColors(event.type);
                  return (
                    <TooltipProvider key={event.id}>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <div
                              className={cn(
                                "w-full cursor-pointer truncate rounded-lg px-2 py-1.5 text-[10px] leading-tight font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95",
                                colors.bg,
                                colors.border,
                                colors.text,
                              )}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 shrink-0 rounded-full",
                                    colors.dot,
                                  )}
                                />
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          }
                        />
                        <TooltipContent
                          side="right"
                          className="z-50 max-w-xs rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                              >
                                {event.type}
                              </Badge>
                              {event.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-success-bg0" />
                              ) : event.status === "urgent" ? (
                                <AlertCircle className="h-4 w-4 animate-bounce text-error-bg0" />
                              ) : null}
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                              <Clock className="h-3 w-3" />
                              {format(event.start, "h:mm a")} -{" "}
                              {format(event.end, "h:mm a")}
                            </div>
                            {event.description && (
                              <p className="border-t pt-2 text-[11px] text-gray-500 italic">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="px-1 text-[10px] font-semibold text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            )}

            {!isMobile && (
              <button className="absolute right-2 bottom-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200">
                <Plus className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="bg-white">{rows}</div>;
  };

  const renderAgenda = () => {
    const selectedEvents = events.filter((e) =>
      isSameDay(e.start, selectedDate),
    );

    return (
      <div className="mt-6 md:mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isSameDay(selectedDate, new Date())
              ? "Today's Agenda"
              : format(selectedDate, "EEEE, MMMM do")}
          </h3>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-bold"
          >
            {selectedEvents.length}{" "}
            {selectedEvents.length === 1 ? "Event" : "Events"}
          </Badge>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-3">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">
              No events scheduled
            </p>
            <p className="text-xs text-gray-500">
              Enjoy your free time or add a new event.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedEvents.map((event) => {
              const colors = getEventColors(event.type);
              return (
                <Card
                  key={event.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-none p-4 shadow-sm transition-all hover:shadow-md",
                    colors.bg,
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full w-1",
                      colors.dot,
                    )}
                  />
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-white/50 bg-white/50 text-[10px] capitalize",
                            colors.text,
                          )}
                        >
                          {event.type}
                        </Badge>
                        {event.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-success-bg0" />
                        ) : event.status === "urgent" ? (
                          <AlertCircle className="h-4 w-4 text-error-bg0" />
                        ) : null}
                      </div>
                      <h4 className="leading-tight font-bold text-gray-900">
                        {event.title}
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        {format(event.start, "h:mm a")} -{" "}
                        {format(event.end, "h:mm a")}
                      </div>
                      {event.description && (
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-2">
                            {event.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] duration-700">
      <Card className="overflow-hidden rounded-3xl border border-none border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm md:rounded-4xl">
        {renderHeader()}
        <div className="p-0">
          {renderDays()}
          {renderCells()}
        </div>
      </Card>

      {/* Render Agenda List below calendar (Essential for Mobile, nice for Desktop) */}
      {renderAgenda()}

      {/* Quick Stats / Info Panel */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
        <Card className="rounded-3xl border-none bg-linear-to-br from-blue-500 to-slate-600 p-5 text-white shadow-xl shadow-blue-100 md:rounded-4xl md:p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur-md md:p-3">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100 md:text-sm">
                Next Up
              </p>
              <h3 className="text-lg font-bold md:text-xl">Faculty Meeting</h3>
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span>Time: 14:00 PM</span>
              <Badge className="border-none bg-white/20 px-2 py-0.5 text-[10px] hover:bg-white/30 md:px-2.5 md:py-1 md:text-xs">
                15 min left
              </Badge>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-white" />
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-none bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:rounded-4xl md:p-6">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h3 className="font-bold text-gray-900">Weekly Progress</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 md:h-16 md:w-16">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray="175"
                  strokeDashoffset="44"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600 md:text-xs">
                75%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 md:text-sm">
                3 of 4 Tasks Done
              </p>
              <p className="text-[10px] text-gray-500 md:text-xs">
                Keep it up! You're almost there.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-none bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:rounded-4xl md:p-6">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h3 className="font-bold text-gray-900">Quick Filters</h3>
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Classes", "Exams", "Meetings", "Deadlines"].map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer rounded-xl border-gray-100 px-3 py-1 text-[10px] text-gray-600 transition-all hover:border-blue-200 hover:bg-blue-50 md:px-4 md:py-1.5 md:text-xs"
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
