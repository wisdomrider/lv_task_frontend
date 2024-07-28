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
import TimezoneSelect from "./TimezoneSelect";

const AddEventModal = ({
  isOpen,
  onClose,
  timezone: systemTimeZone,
  startTime: passedStartTime,
  endTime: passedEndTime,
}) => {
  // in real world application we need to use yup for validation and formik for form handling
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([]);
  const [timezone, setTimezone] = useState(systemTimeZone);
  const [participant, setParticipant] = useState("");
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTimezone(systemTimeZone);
    const parsedStartTime = moment(passedStartTime).format("YYYY-MM-DDTHH:mm");
    const parsedEndTime = moment(passedEndTime).format("YYYY-MM-DDTHH:mm");
    setStartTime(parsedStartTime);
    setEndTime(parsedEndTime);
  }, [isOpen, systemTimeZone, passedStartTime, passedEndTime]);

  const handleAddParticipant = () => {
    // in real world application we need to validate the email using regex
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
      return toast({
        title: "Start time should be before end time",
        status: "error",
      });
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
      .post("/events", data)
      .then(() => {
        toast({ title: "Event created successfully", status: "success" });
        queryClient.invalidateQueries("events");
        onClose();
      })
      .catch((e) => {
        if (e.response?.status === 400) {
          return toast({ title: e.response.data.message, status: "error" });
        } else {
          toast({ title: "Failed to create event", status: "error" });
        }
      })
      .finally(() => {
        setIsLoading(false);
      }
      );
  };

  return (
    <Modal size={"xl"} isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent m={[2, 0]} as="form" onSubmit={handleSave}>
        <ModalHeader>Add an Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Flex} flexDir="column" gap="4">
          <FormControl>
            <FormLabel>Event Name</FormLabel>
            <Input
              required
              placeholder="Event Name"
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Timezone</FormLabel>
            <TimezoneSelect value={timezone} onChange={setTimezone} />
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
              value={endTime}
              type="datetime-local"
              onChange={(e) => setEndTime(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Participants</FormLabel>
            <Flex flexDir="column" gap="2" my="2">
              {participants.map((participantItem, index) => (
                <Flex key={index} gap="4">
                  <Input placeholder="Email" disabled value={participantItem} />
                  {/* remove */}
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
            Add Event
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddEventModal;
