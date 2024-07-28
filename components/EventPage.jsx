import React, { useEffect, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Select, Text, useDisclosure } from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import "moment-timezone";
import ct from "countries-and-timezones";
import TimezoneSelect from "./TimezoneSelect";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "react-query";
import EventDetailModal from "./EventDetailModal";
import EditEventModal from "./EditEventModal";
import AddEventModal from "./AddEventModal";

const fetchEvents = async () => {
  const { data } = await axios.get("/events");
  return data;
};

const fetchHolidays = async (country) => {
  const { data } = await axios.get(`/holidays/${country}`);
  return data;
};

const EventPage = ({ timezone, setTimezone }) => {
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = React.useState(null);
  const [startSlot, setStartSlot] = React.useState(null);
  const [endSlot, setEndSlot] = React.useState(null);

  const { data: events, isLoading: eventsLoading } = useQuery(
    "events",
    fetchEvents,
    {
      reloadOnWindowFocus: false,
    }
  );

  const { data: holidays, isLoading: holidaysLoading } = useQuery(
    ["holidays", timezone],
    async () => {
      if (!timezone) return [];
      const timezoneCountry = ct.getTimezone(timezone);
      if (timezoneCountry?.countries[0]) {
        return fetchHolidays(timezoneCountry.countries[0]);
      }
      return [];
    },
    {
      enabled: !!timezone,
      reloadOnWindowFocus: false,
    }
  );

  const { defaultDate, getNow, localizer, scrollToTime } = useMemo(() => {
    moment.tz.setDefault(timezone);
    return {
      defaultDate: new Date(),
      getNow: () => moment().toDate(),
      localizer: momentLocalizer(moment),
      scrollToTime: moment().toDate(),
    };
  }, [timezone]);

  useEffect(() => {
    return () => {
      moment.tz.setDefault(); // reset to browser TZ on unmount
    };
  }, []);

  const { calendarEvents } = useMemo(() => {
    const calendarEvents = [];
    events?.forEach((event) => {
      // these are utc dates
      calendarEvents.push({
        id: event.id,
        title: event.title,
        start: moment.utc(event.start_time).toDate(),
        end: moment.utc(event.end_time).toDate(),
        timezone: event.timezone,
        description: event.description,
        participants: event.participants,
      });
    });
    holidays?.forEach((holiday) => {
      calendarEvents.push({
        id: uuidv4(),
        title: holiday.name,
        // since holidays api requires a paid plan to get this year's data we will be using last year's data
        start: new Date(holiday.date).setYear(new Date().getFullYear()),
        end: new Date(holiday.date).setYear(new Date().getFullYear()),
        isHoliday: true,
      });
    });

    return { calendarEvents };
  }, [events, holidays]);

  if (eventsLoading || holidaysLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box p="4" h="90vh">
      <Box my="2">
        <Text fontSize="md">Select a timezone</Text>
        <TimezoneSelect value={timezone} onChange={setTimezone} />
      </Box>
      <Calendar
        localizer={localizer}
        defaultView={Views.MONTH}
        views={{ month: true, week: true, day: true, agenda: true }}
        getNow={getNow}
        selectable={true}
        events={calendarEvents}
        scrollToTime={scrollToTime}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={(e) => {
          setStartSlot(e.start);
          setEndSlot(e.end);
          setSelectedEventForEdit(null);
        }}
        onSelectEvent={(event) => setSelectedEvent(event)}
        defaultDate={defaultDate}
      />

      {startSlot && endSlot && (
        <AddEventModal
          isOpen={!!startSlot}
          onClose={() => {
            setStartSlot(null);
            setEndSlot(null);
          }}
          timezone={timezone}
          startTime={startSlot}
          endTime={endSlot}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          timezone={timezone}
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => setSelectedEventForEdit(event)}
        />
      )}
      {selectedEventForEdit && (
        <EditEventModal
          event={selectedEventForEdit}
          timezone={timezone}
          isOpen={!!selectedEventForEdit}
          onClose={() => setSelectedEventForEdit(null)}
        />
      )}
    </Box>
  );
};

export default EventPage;
