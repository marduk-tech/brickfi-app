import React, { useEffect, useState } from "react";
import { Timeline } from "antd";
import dayjs from "dayjs";
import moment from "moment";

interface PhaseItem {
  phase: string;
  name: string;
  startDate: string; // in DD-MM-YYYY
  completionDate: string; // in DD-MM-YYYY
}

interface EventItem {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
}

interface TimelineTabProps {
  lvnzyProject: any;
}

const TimelineTab = ({ lvnzyProject }: TimelineTabProps) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalDays, setTotalDays] = useState<any>();

  const [minDate, setMinDate] = useState<any>();
  useEffect(() => {
    let timelines: any[] = [];

    if (lvnzyProject) {
      timelines = lvnzyProject.meta.projectTimelines.map((t: any) => {
        return {
          phase: lvnzyProject.meta.projectName,
          ...t,
        };
      });
      lvnzyProject.developer.reraOtherPhases.forEach((p: any) => {
        timelines = [
          ...timelines,
          ...p.projectDetails.listOfRegistrationsExtensions.map((t: any) => {
            return {
              phase: p.projectDetails.projectName,
              ...t,
            };
          }),
        ];
      });
      console.log(timelines);

      // Step 1: Find final completion date per phase
      const phaseCompletionMap: Record<string, moment.Moment> = {};

      timelines.forEach((item) => {
        const completion = moment(item.completionDate, "DD-MM-YYYY");
        if (
          !phaseCompletionMap[item.phase] ||
          completion.isAfter(phaseCompletionMap[item.phase])
        ) {
          phaseCompletionMap[item.phase] = completion;
        }
      });

      // Step 2: Build event list
      const events: EventItem[] = [];

      // Add start events
      timelines.forEach((item) => {
        events.push({
          date: moment(item.startDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
          title: item.phase,
          description: item.name,
        });
      });

      // Add one completion event per phase
      Object.entries(phaseCompletionMap).forEach(([phase, completion]) => {
        events.push({
          date: completion.format("YYYY-MM-DD"),
          title: phase,
          description: "Final Completion",
        });
      });

      // Step 3: Sort events by date
      events.sort((a, b) => moment(a.date).diff(moment(b.date)));
      setEvents(events);
      const minDate = dayjs(events[0].date);
      setMinDate(minDate);
      const maxDate = dayjs(events[events.length - 1].date);
      setTotalDays(maxDate.diff(minDate, "day"));
    }
  }, [lvnzyProject]);

  

  return (
    <div
      style={{
        position: "relative",
        paddingLeft: 40,
        margin: "40px 0",
        height: 1500,
      }}
    >
      {/* line background */}
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 0,
          bottom: 0,
          width: 2,
          background: "#d9d9d9",
          zIndex: 0,
        }}
      />
      {events.map((event, index) => {
        const daysFromStart = dayjs(event.date).diff(minDate, "day");
        let topPercent = (daysFromStart / totalDays) * 100;

          const dateCountMap: Record<string, number> = {};

         // Handle duplicate dates by adding offset
        dateCountMap[event.date] = (dateCountMap[event.date] || 0) + 1;
        const offset = (dateCountMap[event.date] - 1) * 50; // 50px per duplicate
        topPercent += (offset / 600) * 100; // scale offset to % (assuming container height ~400px)

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${topPercent}%`,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            {/* timeline line */}
            {/* <div
              style={{
                width: 2,
                height: index < events.length - 1 ? "100px" : 0,
                backgroundColor: "#1890ff",
                marginRight: 10,
              }}
            ></div> */}

            {/* dot */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                marginRight: 10,
                marginLeft: -4,
              }}
            ></div>

            {/* label */}
            <div>
              <strong>{event.title}</strong>
              <div style={{ fontSize: 12, color: "#888" }}>
                {dayjs(event.date).format("DD MMM YYYY")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineTab;
