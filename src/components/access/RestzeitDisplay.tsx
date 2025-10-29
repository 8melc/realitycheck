'use client';

import { useMemo } from 'react';

export default function RestzeitDisplay() {
  const restzeitInfo = useMemo(() => {
    const now = new Date();
    const yearEnd = new Date(now.getFullYear(), 11, 31); // December 31
    
    // Calculate Saturdays until end of year
    let saturdays = 0;
    const tempDate = new Date(now);
    while (tempDate <= yearEnd) {
      if (tempDate.getDay() === 6) { // Saturday
        saturdays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Calculate weekends (Saturdays + Sundays)
    let weekends = 0;
    const tempDate2 = new Date(now);
    while (tempDate2 <= yearEnd) {
      const day = tempDate2.getDay();
      if (day === 6 || day === 0) { // Saturday or Sunday
        weekends++;
      }
      tempDate2.setDate(tempDate2.getDate() + 1);
    }
    
    // Calculate days
    const daysUntilEnd = Math.ceil((yearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      saturdays,
      weekends,
      days: daysUntilEnd,
    };
  }, []);
  
  return (
    <div className="restzeit-display">
      <div className="restzeit-display__badge">RESTZEIT</div>
      <div className="restzeit-display__content">
        <div className="restzeit-display__stat">
          <div className="restzeit-display__number">{restzeitInfo.saturdays}</div>
          <div className="restzeit-display__label">Samstage bis {new Date().getFullYear() + 1}</div>
        </div>
        <div className="restzeit-display__divider" />
        <div className="restzeit-display__stat">
          <div className="restzeit-display__number">{restzeitInfo.weekends}</div>
          <div className="restzeit-display__label">Wochenenden übrig</div>
        </div>
        <div className="restzeit-display__divider" />
        <div className="restzeit-display__stat">
          <div className="restzeit-display__number">{restzeitInfo.days}</div>
          <div className="restzeit-display__label">Tage bis Jahresende</div>
        </div>
      </div>
      <p className="restzeit-display__quote">
        Wie verbringst du deinen nächsten Samstag?
      </p>
    </div>
  );
}
