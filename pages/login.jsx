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

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


//   you can use react-query instead for caching and fetching data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      setIsLoading(true);
      const response = await axios.post("/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access_token}`;
      setUser(response.data.user);
      router.push("/");
    } catch (error) {
      setError("Invalid credentials");
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <Box w="400px" p={4} m="20px auto" borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" textAlign="center">
        Login
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
          <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading} disabled={isLoading}>
            Login
          </Button>
          <Flex gap="1">
            <Text> Don't have an account? </Text>
            <Text
                _hover={{ cursor: "pointer" }}
              decoration="underline"
              colorScheme="blue"
              onClick={() => router.push("/register")}
            >
              Register
            </Text>
          </Flex>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
}
