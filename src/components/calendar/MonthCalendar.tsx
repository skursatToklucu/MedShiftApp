import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Shift, ShiftStatus, User } from '../../types';
import Button from '../ui/Button';

interface MonthCalendarProps {
  shifts: Shift[];
  users: User[];
  onShiftClick: (shift: Shift) => void;
  onDateClick: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ shifts, users, onShiftClick, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            leftIcon={<ChevronLeftIcon size={16} />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            rightIcon={<ChevronRightIcon size={16} />}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="font-medium text-neutral-600 text-sm text-center py-2">
          {weekDays[i]}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b border-neutral-200">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dayShifts = shifts.filter(shift => {
          const shiftDate = new Date(shift.startDate);
          return isSameDay(shiftDate, day);
        });
        
        days.push(
          <div
            key={formattedDate}
            className={`min-h-[100px] p-2 border border-neutral-200 ${
              !isSameMonth(day, monthStart)
                ? 'bg-neutral-50 text-neutral-400'
                : 'bg-white'
            }`}
            onClick={() => onDateClick(day)}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, 'd')}
            </div>
            
            <div className="space-y-1">
              {dayShifts.map(shift => {
                const user = users.find(u => u.id === shift.userId);
                return (
                  <div
                    key={shift.id}
                    className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                      shift.isEmergency
                        ? 'bg-error-100 text-error-800 hover:bg-error-200'
                        : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                    } ${
                      shift.status === ShiftStatus.DRAFT
                        ? 'opacity-70'
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShiftClick(shift);
                    }}
                  >
                    {user?.fullName || 'Unassigned'}
                  </div>
                );
              })}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      
      days = [];
    }

    return <div className="border-l border-t border-neutral-200">{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-smooth overflow-hidden">
      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
};

export default MonthCalendar;