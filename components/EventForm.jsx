import { useState, useEffect } from "react";
import { Box, Button, Input, Textarea, VStack, Heading, Select, Alert, AlertIcon } from "@chakra-ui/react";
import axios from "axios";

export default function EventForm({ event, onSubmit, user }) {
  const [title, setTitle] = useState(event?.title || "");
  const [startTime, setStartTime] = useState(event?.start_time || "");
  const [endTime, setEndTime] = useState(event?.end_time || "");
  const [description, setDescription] = useState(event?.description || "");
  const [participants, setParticipants] = useState(event?.participants || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      setError("Please fill in all required fields.");
      setSuccess("");
      return;
    }

    const payload = { title, start_time: startTime, end_time: endTime, description, participants };

    try {
      if (event) {
        await axios.put(`/events/${event.id}`, payload);
        setSuccess("Event updated successfully!");
      } else {
        await axios.post("/events", payload);
        setSuccess("Event created successfully!");
      }
      setError("");
      onSubmit();
    } catch (error) {
      setError("Failed to save event.");
      setSuccess("");
    }
  };

  return (
    <Box w="500px" p={4} m="20px auto" borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" textAlign="center">{event ? "Edit Event" : "Create Event"}</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} mt={4}>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            placeholder="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Textarea
            placeholder="Participants (comma-separated emails)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
          <Button type="submit" colorScheme="teal" width="full">{event ? "Update Event" : "Create Event"}</Button>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {success && (
            <Alert status="success">
              <AlertIcon />
              {success}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
}
