import { Box, Flex, Button, Heading, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import AddEventModal from "./AddEventModal";

const Navbar = ({ user, setUser, timezone }) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <Flex
      flexWrap="wrap"
      bg="teal.500"
      p={4}
      color="white"
      justify="space-between"
      alignItems="center"
    >
      <Heading as="h1" size="lg">
        Scheduler App
      </Heading>
      <Box>
        {user ? (
          <Flex gap={4}>
            <Button colorScheme="blue" onClick={onOpen}>
              Add Event
            </Button>
            <Button colorScheme="blue" onClick={handleLogout}>
              Logout
            </Button>
            <AddEventModal
              isOpen={isOpen}
              onClose={onClose}
              timezone={timezone}
            />
          </Flex>
        ) : (
          <Flex gap={4}>
            <Button colorScheme="blue" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button colorScheme="blue" onClick={() => router.push("/register")}>
              Register
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default Navbar;
