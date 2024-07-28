"use client";
import Navbar from "../components/Navbar";
import { Box, Text } from "@chakra-ui/react";
import EventPage from "../components/EventPage";
const Home = ({ user, setUser, timezone, setTimezone }) => {
  return (
    <div>
      <Navbar user={user} setUser={setUser} timezone={timezone} />
      {user ? (
        <EventPage user={user} timezone={timezone} setTimezone={setTimezone} />
      ) : (
        <Box p="4" h="90vh">
          <Text fontSize="xl">Please login/register to view your events</Text>
        </Box>
      )}
    </div>
  );
};

export default Home;
