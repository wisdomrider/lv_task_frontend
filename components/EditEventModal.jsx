"use client";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import moment from "moment";
import "moment-timezone";
import axios from "axios";
import { useQueryClient } from "react-query";

const EditEventModal = ({
  isOpen,
  onClose,
  event,
  timezone: systemTimeZone,
}) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([]);
  const [timezone, setTimezone] = useState(event.timezone || systemTimeZone);
  const [participant, setParticipant] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      const _timezone = event.timezone || systemTimeZone;
      setTitle(event.title);
      setStartTime(
        moment.utc(event.start).tz(_timezone).format("YYYY-MM-DDTHH:mm")
      );
      setEndTime(
        moment.utc(event.end).tz(_timezone).format("YYYY-MM-DDTHH:mm")
      );
      setDescription(event.description);
      setParticipants(event.participants || []);
      setTimezone(_timezone);
    }
  }, [event, isOpen]);

  const handleAddParticipant = () => {
    if (!participant || !participant.includes("@")) {
      return toast({ title: "Invalid Email", status: "error" });
    }

    if (participants.includes(participant)) {
      return toast({ title: "Participant already added", status: "error" });
    }

    setParticipants([...participants, participant]);
    setParticipant("");
  };

  const handleRemoveParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSave = (e) => {
    e.preventDefault();

    const currenTimezone = moment.tz.guess();
    moment.tz.setDefault(timezone);

    if (moment(startTime).isAfter(endTime)) {
      return toast({ title: "Invalid time range", status: "error" });
    }

    if (moment(startTime).isBefore(moment())) {
      return toast({ title: "Start time is in the past", status: "error" });
    }

    const data = {
      title,
      start_time: moment(startTime).utc().toISOString(),
      end_time: moment(endTime).utc().toISOString(),
      description,
      participants,
      timezone,
    };

    moment.tz.setDefault(currenTimezone);

    setIsLoading(true);
    axios
      .put(`/events/${event.id}`, data)
      .then(() => {
        toast({ title: "Event updated successfully", status: "success" });
        queryClient.invalidateQueries("events");
        onClose();
      })
      .catch(() => {
        toast({ title: "Failed to update event", status: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal size={"xl"} isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent m={[2, 0]} as="form" onSubmit={handleSave}>
        <ModalHeader>Edit Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Flex} flexDir="column" gap="4">
          <FormControl>
            <FormLabel>Event Name</FormLabel>
            <Input
              required
              placeholder="Event Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Timezone</FormLabel>
            <Select
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {moment.tz.names().map((timezone, index) => (
                <option key={index} value={timezone}>
                  {timezone}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Start Time</FormLabel>
            <Input
              required
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Time</FormLabel>
            <Input
              required
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Participants</FormLabel>
            <Flex flexDir="column" gap="2" my="2">
              {participants.map((participantItem, index) => (
                <Flex key={index} gap="4">
                  <Input placeholder="Email" disabled value={participantItem} />
                  <Button
                    onClick={() => handleRemoveParticipant(index)}
                    colorScheme="red"
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
            </Flex>

            <Flex gap="4">
              <Input
                type="email"
                placeholder="Email"
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
              />
              <Button onClick={handleAddParticipant} colorScheme="green">
                Add
              </Button>
            </Flex>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} type="submit" isLoading={isLoading} disabled={isLoading}>
            Update Event
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditEventModal;
