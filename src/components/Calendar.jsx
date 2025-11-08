import React from 'react'

export default function Calendar(){
  return (
    <aside className="calendar" aria-label="Events calendar">
      <div className="month-title">
        <strong id="calMonthTitle"></strong>
        <div>
          <button id="prevMonth" className="btn secondary" style={{ padding: '6px 8px' }}>◀</button>
          <button id="nextMonth" className="btn secondary" style={{ padding: '6px 8px' }}>▶</button>
        </div>
      </div>
      <div className="cal-weekdays" id="calWeekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="cal-grid" id="calendarGrid"></div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ marginBottom: 8 }}>Upcoming Events</h4>
        <div id="upcomingEventsList"></div>
      </div>
    </aside>
  )
}
