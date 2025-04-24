import React, { useState, useEffect } from 'react';
import './TimeBlocking.css';
import { getTimeBlocks, createTimeBlock, updateTimeBlock, deleteTimeBlock } from '../../utils/api';

const TimeBlockingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [blocks, setBlocks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState({
    startTime: '',
    endTime: ''
  });
  const [newBlock, setNewBlock] = useState({
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    category: 'academic',
    priority: 'high',
    isRecurring: false,
    recurringType: 'none', // 'none', 'daily', 'weekly', 'monthly'
    recurringEndDate: ''
  });

  const categories = {
    academic: { label: 'Academic', color: '#4285F4' },
    personal: { label: 'Personal', color: '#0F9D58' },
    work: { label: 'Work', color: '#DB4437' },
    project: { label: 'Project', color: '#F4B400' }
  };

  const priorities = {
    high: { label: 'High Priority', color: '#ff4444' },
    medium: { label: 'Medium Priority', color: '#ffbb33' },
    low: { label: 'Low Priority', color: '#00c851' }
  };

  const recurringTypes = [
    { value: 'none', label: 'Not recurring' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    loadTimeBlocks();
  }, [selectedDate]);

  const loadTimeBlocks = async () => {
    try {
      const blocks = await getTimeBlocks();
      setBlocks(blocks);
    } catch (error) {
      console.error('Error loading time blocks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blockData = {
        ...newBlock,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeRange.startTime,
        endTime: selectedTimeRange.endTime
      };
      
      await createTimeBlock(blockData);
      setShowAddForm(false);
      setNewBlock({
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        category: 'academic',
        priority: 'high',
        isRecurring: false,
        recurringType: 'none',
        recurringEndDate: ''
      });
      setSelectedTimeRange({ startTime: '', endTime: '' });
      loadTimeBlocks();
    } catch (error) {
      console.error('Error creating time block:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTimeBlock(id);
      loadTimeBlocks();
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysInWeek = () => {
    const days = [];
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + i);
      days.push(newDate);
    }
    return days;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getBlocksForDateAndTime = (date, timeSlot) => {
    return blocks.filter(block => {
      const blockDate = new Date(block.date);
      return blockDate.getDate() === date.getDate() &&
        blockDate.getMonth() === date.getMonth() &&
        blockDate.getFullYear() === date.getFullYear() &&
        block.startTime <= timeSlot &&
        block.endTime > timeSlot;
    });
  };

  const getBlocksForDay = (date) => {
    return blocks.filter(block => {
      const blockDate = new Date(block.date);
      return blockDate.getDate() === date.getDate() &&
        blockDate.getMonth() === date.getMonth() &&
        blockDate.getFullYear() === date.getFullYear();
    });
  };

  const getBlocksForDayView = () => {
    return getBlocksForDay(selectedDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const handleTimeSlotClick = (date, startTime) => {
    setSelectedDate(date);
    setSelectedTimeRange(prev => ({
      startTime: startTime,
      endTime: prev.endTime || startTime
    }));
    setShowAddForm(true);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const navigate = (direction) => {
    const newDate = new Date(selectedDate);
    
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (7 * direction));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setSelectedDate(newDate);
  };

  const renderDayView = () => {
    const dayBlocks = getBlocksForDayView();
    
    return (
      <div className="calendar-grid day-view">
        <div className="time-slots-column">
          <div className="time-slot-header"></div>
          {timeSlots.map(slot => (
            <div key={slot} className="time-slot-label">{slot}</div>
          ))}
        </div>
        <div className="day-column full-width">
          <div className="day-header">
            <div className="day-name">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
            <div className="day-date">{selectedDate.getDate()}</div>
          </div>
          {timeSlots.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              className="time-slot"
              onClick={() => handleTimeSlotClick(selectedDate, slot)}
            >
              {getBlocksForDateAndTime(selectedDate, slot).map((block, index) => (
                <div
                  key={index}
                  className="time-block"
                  style={{
                    backgroundColor: categories[block.category]?.color || '#4285F4',
                    borderLeft: `4px solid ${priorities[block.priority]?.color || '#ff4444'}`
                  }}
                >
                  <div className="block-title">{block.title}</div>
                  <div className="block-time">
                    {block.startTime} - {block.endTime}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(block.id);
                    }} 
                    className="delete-block"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getDaysInWeek();

    return (
      <div className="calendar-grid week-view">
        <div className="time-slots-column">
          <div className="time-slot-header"></div>
          {timeSlots.map(slot => (
            <div key={slot} className="time-slot-label">{slot}</div>
          ))}
        </div>
        {weekDays.map((day, dayIndex) => (
          <div 
            key={dayIndex} 
            className={`day-column ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
          >
            <div className="day-header" onClick={() => handleDateClick(day)}>
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
            {timeSlots.map((slot, slotIndex) => (
              <div
                key={`${dayIndex}-${slotIndex}`}
                className="time-slot"
                onClick={() => handleTimeSlotClick(day, slot)}
              >
                {getBlocksForDateAndTime(day, slot).map((block, index) => (
                  <div
                    key={index}
                    className="time-block"
                    style={{
                      backgroundColor: categories[block.category]?.color || '#4285F4',
                      borderLeft: `4px solid ${priorities[block.priority]?.color || '#ff4444'}`
                    }}
                  >
                    <div className="block-title">{block.title}</div>
                    <div className="block-time">
                      {block.startTime} - {block.endTime}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(block.id);
                      }} 
                      className="delete-block"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid month-view">
        {weekDays.map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
        {days.map((date, index) => (
          <div
            key={index}
            className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''} ${!isCurrentMonth(date) ? 'other-month' : ''}`}
            onClick={() => handleDateClick(date)}
          >
            <div className="day-header">
              <span className="day-number">{date.getDate()}</span>
            </div>
            <div className="day-blocks">
              {getBlocksForDay(date).slice(0, 3).map((block, i) => (
                <div 
                  key={i} 
                  className="time-block-month" 
                  style={{ 
                    backgroundColor: categories[block.category]?.color || '#4285F4',
                    borderLeft: `4px solid ${priorities[block.priority]?.color || '#ff4444'}`
                  }}
                >
                  <span className="block-time-month">{block.startTime}</span>
                  <span className="block-title-month">{block.title}</span>
                </div>
              ))}
              {getBlocksForDay(date).length > 3 && (
                <div className="more-blocks">+{getBlocksForDay(date).length - 3} more</div>
              )}
            </div>
            <button
              className="add-block-button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(date);
                setShowAddForm(true);
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };

  const getNavButtonText = () => {
    switch (view) {
      case 'day':
        return { prev: 'Previous Day', next: 'Next Day' };
      case 'week':
        return { prev: 'Previous Week', next: 'Next Week' };
      case 'month':
        return { prev: 'Previous Month', next: 'Next Month' };
      default:
        return { prev: 'Previous', next: 'Next' };
    }
  };

  const getHeaderText = () => {
    switch (view) {
      case 'day':
        return formatDate(selectedDate);
      case 'week':
        const weekDays = getDaysInWeek();
        const startDate = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startDate} - ${endDate}`;
      case 'month':
        return formatMonthYear(selectedDate);
      default:
        return formatDate(selectedDate);
    }
  };

  return (
    <div className="time-blocking-container">
      <div className="calendar-header">
        <h2>{getHeaderText()}</h2>
        <div className="view-controls">
          <button 
            className={view === 'day' ? 'active' : ''} 
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button 
            className={view === 'week' ? 'active' : ''} 
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button 
            className={view === 'month' ? 'active' : ''} 
            onClick={() => setView('month')}
          >
            Month
          </button>
        </div>
        <div className="calendar-controls">
          <button onClick={() => navigate(-1)}>
            {getNavButtonText().prev}
          </button>
          <button onClick={() => setSelectedDate(new Date())}>
            Today
          </button>
          <button onClick={() => navigate(1)}>
            {getNavButtonText().next}
          </button>
        </div>
      </div>

      {renderView()}

      {showAddForm && (
        <div className="add-block-form">
          <h3>Add New Time Block</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={selectedDate.toISOString().split('T')[0]} 
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>Time Range</label>
              <div className="time-range-inputs">
                <select
                  value={selectedTimeRange.startTime}
                  onChange={(e) => setSelectedTimeRange(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                >
                  <option value="">Start Time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <select
                  value={selectedTimeRange.endTime}
                  onChange={(e) => setSelectedTimeRange(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                >
                  <option value="">End Time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newBlock.title}
                onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newBlock.description}
                onChange={(e) => setNewBlock(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newBlock.category}
                onChange={(e) => setNewBlock(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {Object.entries(categories).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={newBlock.priority}
                onChange={(e) => setNewBlock(prev => ({ ...prev, priority: e.target.value }))}
                required
              >
                {Object.entries(priorities).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group recurring-container">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={newBlock.isRecurring} 
                  onChange={(e) => setNewBlock(prev => ({ 
                    ...prev, 
                    isRecurring: e.target.checked,
                    recurringType: e.target.checked ? 'daily' : 'none'
                  }))}
                />
                Recurring Task
              </label>
              
              {newBlock.isRecurring && (
                <>
                  <div className="recurring-options">
                    <label>Recurrence</label>
                    <select
                      value={newBlock.recurringType}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, recurringType: e.target.value }))}
                    >
                      {recurringTypes.slice(1).map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="recurring-end">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={newBlock.recurringEndDate}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="form-actions">
              <button type="submit">Save Block</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TimeBlockingCalendar;