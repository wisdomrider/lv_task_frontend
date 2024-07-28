import { ChakraProvider } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import moment from "moment";
import "moment-timezone";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [timezone, setTimezone] = useState("Asia/Kathmandu");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const timezone = localStorage.getItem("timezone");
    if (timezone) {
      setTimezone(timezone);
    }
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      axios
        .get("/auth/me")
        .then((response) => setUser(response.data))
        .catch((e) => {
          if (e.response?.status === 401) {
            setUser(null);
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
          setUser(null);
        });
    }
  }, []);

  // when timezone changes we need to update the default timezone

  useEffect(() => {
    localStorage.setItem("timezone", timezone);
    moment.tz.setDefault(timezone);
  }, [timezone]);

  const queryClient = new QueryClient();

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        {/* we need to use context api or redux here but since time was limited I drilled it */}
        <Component
          {...pageProps}
          user={user}
          setUser={setUser}
          timezone={timezone}
          setTimezone={setTimezone}
        />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
