import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
  ModalCloseButton,
  Flex,
  Avatar,
  ModalFooter,
  Button,
  useToast,
  Divider,
} from "@chakra-ui/react";
import React from "react";
import moment from "moment";
import { useMemo } from "react";
import axios from "axios";
import { useQueryClient, useMutation } from "react-query";
import { FaClock } from "react-icons/fa";
const deleteEvent = async (eventId) => {
  await axios.delete(`/events/${eventId}`);
};

const EventDetailModal = ({ isOpen, onClose, event, timezone, onEdit }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation(deleteEvent, {
    onSuccess: () => {
      toast({ title: "Event deleted successfully", status: "success" });
      queryClient.invalidateQueries("events");
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to delete event", status: "error" });
    },
  });

  const { title, startTime, endTime } = useMemo(() => {
    if (!event) return;
    return {
      title: event.title,
      startTime: moment.utc(event.start).tz(timezone).format("LLL"),
      endTime: moment.utc(event.end).tz(timezone).format("LLL"),
    };
  }, [event]);

  const handleDelete = () => {
    mutation.mutate(event.id);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex align="center" gap="2">
              <FaClock />
              <Text color="gray" fontSize="sm">
                {startTime} - {endTime}
              </Text>
            </Flex>
            <Divider my="4" />

            <Text mt="4">
              {event.isHoliday
                ? "Public holiday."
                : event.description || "No description provided."}
            </Text>
            {event.participants?.length > 0 && <Text mt="4">Participants</Text>}

            {event.participants?.map((participant) => (
              <Flex
                rounded="lg"
                p="2"
                bg="gray.200"
                key={participant}
                alignItems="center"
                mt="2"
                gap="4"
              >
                <Avatar size="xs" name={participant} />
                <Text fontSize="xs">{participant}</Text>
              </Flex>
            ))}
          </ModalBody>
          <ModalFooter>
            {!event.isHoliday && (
              <Flex gap="4">
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    onEdit(event);
                    onClose();
                  }}
                >
                  Edit
                </Button>
                <Button
                  colorScheme="red"
                  isLoading={mutation.isLoading}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Flex>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EventDetailModal;
