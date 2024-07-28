import { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Flex,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post("/register", { email, password });
      setSuccess("User registered successfully!");
      setError("");
      router.push("/login");
    } catch (error) {
      if (error.response?.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Failed to register");
      }
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="400px" p={4} m="20px auto" borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" textAlign="center">
        Register
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} mt={4}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            colorScheme="teal"
            width="full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Register
          </Button>
          <Flex gap="1">
            <Text> Already have an account? </Text>
            <Text
              _hover={{ cursor: "pointer" }}
              decoration="underline"
              colorScheme="blue"
              onClick={() => router.push("/login")}
            >
              Login
            </Text>
          </Flex>
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
