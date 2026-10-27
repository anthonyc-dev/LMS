import { useState, useMemo } from "react";
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
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Hash,
  AlertTriangle,
  RotateCcw,
  CalendarDays,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useAuthStore } from "@/app/store/authStore";
import {
  useBorrowings,
  useReturnBook,
  type Borrowing,
} from "@/features/circulation/api/circulation";
import { toast } from "sonner";
import LoadingSpinner from "@/shared/components/GlobalLoading";

type EventType = "borrowed" | "due-soon" | "overdue" | "returned" | "reserved";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  originalData: Borrowing;
}

const SchedulePage = () => {
  usePageTitle("Library Calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const { user } = useAuthStore();
  const { data: allBorrowings = [], isLoading } = useBorrowings();
  const returnMutation = useReturnBook();

  // Map borrowings to events
  const events = useMemo(() => {
    let filtered = allBorrowings as Borrowing[];

    // Role-based filtering
    if (user?.role === "student" || user?.role === "faculty") {
      filtered = filtered.filter((b) => b.user?.id === user.id);
    }

    // Search filtering
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookCopy?.book.title.toLowerCase().includes(q) ||
          b.user?.fullName.toLowerCase().includes(q) ||
          b.bookCopy?.barcode.toLowerCase().includes(q),
      );
    }

    return filtered.map((b) => {
      let type: EventType = "borrowed";
      let eventDate = parseISO(b.dueDate);

      if (b.status === "pending") {
        type = "reserved";
        eventDate = parseISO(b.borrowDate);
      } else if (b.status === "returned") {
        type = "returned";
        eventDate = parseISO(b.returnedDate || b.dueDate);
      } else if (
        b.status === "overdue" ||
        differenceInDays(eventDate, new Date()) < 0
      ) {
        type = "overdue";
      } else if (differenceInDays(eventDate, new Date()) <= 3) {
        type = "due-soon";
      }

      return {
        id: b.id,
        title: b.bookCopy?.book.title || "Unknown Book",
        date: eventDate,
        type,
        originalData: b,
      };
    });
  }, [allBorrowings, user, searchQuery]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventColors = (type: EventType) => {
    switch (type) {
      case "reserved":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          dot: "bg-blue-500",
          label: "Reserved",
        };
      case "borrowed":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          label: "Borrowed",
        };
      case "due-soon":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          dot: "bg-amber-500",
          label: "Due Soon",
        };
      case "overdue":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          dot: "bg-red-500",
          label: "Overdue",
        };
      case "returned":
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-600",
          dot: "bg-slate-400",
          label: "Returned",
        };
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await returnMutation.mutateAsync({ borrowingId: id });
      toast.success("Book returned successfully");
      setSelectedEvent(null);
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error("Failed to return book");
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col items-start justify-between rounded-t-3xl border-b border-slate-200/50 bg-white/80 p-4 backdrop-blur-xl md:flex-row md:items-center md:px-6 md:py-6">
        <div className="mb-4 flex items-center gap-4 md:mb-0">
          <div className="rounded-2xl bg-slate-900 p-2.5 shadow-slate-200 md:p-3">
            <CalendarDays className="h-5 w-5 text-white md:h-6 md:w-6" />
          </div>
          <div className="flex flex-col items-start text-left">
            <h2 className="text-xl leading-tight font-bold text-slate-900 md:text-2xl">
              Library Schedule
            </h2>
            <p className="text-xs font-medium text-slate-500 md:text-sm">
              {user?.role === "admin"
                ? "Manage global library schedule"
                : "Track your borrowed books"}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-4">
          {/* Calendar Controls Group */}
          <div className="flex w-full items-center justify-between gap-1 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm md:w-auto md:justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-10 w-10 shrink-0 rounded-xl transition-all duration-300 hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-10 flex-1 rounded-xl px-2 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-100 sm:px-4 md:flex-none"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {format(currentDate, "MMMM yyyy")}
                    </span>
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="center">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-10 w-10 shrink-0 rounded-xl transition-all duration-300 hover:bg-slate-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Today Button */}
          <Button
            variant="outline"
            onClick={goToToday}
            className="flex h-10 w-full rounded-xl px-4 text-sm font-bold md:w-auto"
          >
            Today
          </Button>

          {/* Search Bar */}
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="group relative flex-1 md:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="text"
                placeholder="Search books or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-9 text-sm shadow-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {days.map((day) => (
          <div key={day} className="py-2 text-center md:py-4">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase md:text-xs">
              {isMobile ? day.charAt(0) : day}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[400px] items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      );
    }

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
        const dayEvents = events.filter((e) => isSameDay(e.date, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-start border-r border-b border-slate-100 p-1 transition-all duration-300 hover:bg-slate-50/50 md:items-start md:p-2",
              isMobile ? "h-16" : "min-h-[130px] xl:min-h-[140px]",
              !isSameMonth(day, monthStart)
                ? "bg-slate-50/30 text-slate-300"
                : "text-slate-700",
              isSameDay(day, selectedDate)
                ? "bg-blue-50/40 ring-1 ring-blue-100 ring-inset"
                : "",
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex w-full items-center justify-center md:mb-2 md:justify-between md:px-1">
              <span
                className={cn(
                  "flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 md:text-sm",
                  isMobile ? "mt-1 h-7 w-7" : "h-8 w-8",
                  isToday(day)
                    ? "scale-110 bg-slate-900 text-white shadow-md"
                    : isSameDay(day, selectedDate)
                      ? "bg-slate-200 text-slate-900"
                      : "group-hover:bg-slate-100",
                )}
              >
                {formattedDate}
              </span>
              {!isMobile && dayEvents.length > 0 && (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
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
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={cn(
                                "w-full cursor-pointer truncate rounded-lg border px-2 py-1.5 text-[10px] leading-tight font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95",
                                colors.bg,
                                colors.border,
                                colors.text,
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
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
                          className="z-50 max-w-xs rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                              >
                                {colors.label}
                              </Badge>
                              {event.type === "overdue" && (
                                <AlertCircle className="h-4 w-4 animate-pulse text-red-500" />
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {event.title}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Borrower: {event.originalData.user?.fullName}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="px-1 text-[10px] font-semibold text-slate-400">
                    +{dayEvents.length - 3} more items
                  </div>
                )}
              </div>
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
      isSameDay(e.date, selectedDate),
    );

    return (
      <div className="mt-6 md:mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {isSameDay(selectedDate, new Date())
              ? "Today's Agenda"
              : format(selectedDate, "EEEE, MMMM do")}
          </h3>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-bold text-slate-700"
          >
            {selectedEvents.length}{" "}
            {selectedEvents.length === 1 ? "Item" : "Items"}
          </Badge>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3">
              <CalendarIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              No items for this date
            </p>
            <p className="text-xs text-slate-500">
              Select another day to view due dates or reservations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedEvents.map((event) => {
              const colors = getEventColors(event.type);
              return (
                <Card
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-2xl border border-slate-100 p-4 shadow-sm transition-all hover:shadow-md",
                    "bg-white hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full w-1.5",
                      colors.dot,
                    )}
                  />
                  <div className="flex h-full flex-col justify-between gap-4 pl-2">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-transparent text-[10px] capitalize",
                            colors.bg,
                            colors.text,
                          )}
                        >
                          {colors.label}
                        </Badge>
                        {event.type === "returned" && (
                          <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        )}
                        {event.type === "overdue" && (
                          <AlertTriangle className="h-4 w-4 animate-pulse text-red-500" />
                        )}
                      </div>
                      <h4 className="line-clamp-1 leading-tight font-bold text-slate-900">
                        {event.title}
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        {event.type === "reserved" ? "Reserved on: " : "Due: "}
                        {format(event.date, "MMM dd, yyyy")}
                      </div>
                      {user?.role === "admin" && (
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                          <UserIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">
                            {event.originalData.user?.fullName}
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

  const renderEventModal = () => {
    if (!selectedEvent) return null;
    const { originalData: data, title, type } = selectedEvent;
    const colors = getEventColors(type);

    return (
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(o) => !o && setSelectedEvent(null)}
      >
        <DialogContent className="border-primary/20 overflow-hidden rounded-xl border p-0 shadow-sm sm:max-w-[425px]">
          <div className={"bg-primary h-3 w-full"} />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <Badge
                  className={cn(
                    "rounded-lg border-transparent shadow-none",
                    colors.bg,
                    colors.text,
                  )}
                >
                  {colors.label}
                </Badge>
                {data.fines && data.fines.length > 0 ? (
                  <Badge
                    variant="destructive"
                    className="rounded-lg shadow-none"
                  >
                    Fine:
                    {data.fines
                      .reduce((sum, f) => sum + Number(f.amount), 0)
                      .toFixed(2)}
                  </Badge>
                ) : null}
              </div>
              <DialogTitle className="text-xl leading-tight font-bold text-slate-900">
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Borrower
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {data.user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500">{data.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      Due Date
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {format(parseISO(data.dueDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      Copy Barcode
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {data.bookCopy?.barcode || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                className="w-full rounded-xl sm:w-auto"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              {user?.role === "admin" && data.status !== "returned" && (
                <Button
                  onClick={() => handleReturn(data.id)}
                  disabled={returnMutation.isPending}
                  className="bg-primary hover:bg-primary/90 w-full rounded-xl text-white sm:w-auto"
                >
                  {returnMutation.isPending ? (
                    <LoadingSpinner />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Mark as Returned
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] duration-700">
      <Card className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-sm md:rounded-4xl">
        {renderHeader()}
        <div className="p-0">
          {renderDays()}
          {renderCells()}
        </div>
      </Card>

      {renderAgenda()}
      {renderEventModal()}
    </div>
  );
};

export { SchedulePage };
