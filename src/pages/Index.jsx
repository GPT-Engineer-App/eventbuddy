import { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Input, VStack, HStack, Text, Heading, useToast, IconButton, Spinner } from "@chakra-ui/react";
import { FaSignInAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editEventId, setEditEventId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchEvents();
    }
    setIsLoading(false);
  }, []);

  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchEvents();
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEvents([]);
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { name: eventName, description: eventDescription } }),
      });
      if (response.ok) {
        setEventName("");
        setEventDescription("");
        fetchEvents();
        toast({
          title: "Event created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events/${editEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { name: eventName, description: eventDescription } }),
      });
      if (response.ok) {
        setEditEventId(null);
        setEventName("");
        setEventDescription("");
        fetchEvents();
        toast({
          title: "Event updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchEvents();
        toast({
          title: "Event deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box maxWidth="400px" margin="auto" mt={8}>
        <Heading mb={8}>Event Management App</Heading>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button leftIcon={<FaSignInAlt />} onClick={login}>
            Login
          </Button>
          <Button onClick={register}>Register</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" margin="auto" mt={8}>
      <Heading mb={8}>Event Management App</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <FormControl>
            <FormLabel>Event Name</FormLabel>
            <Input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Event Description</FormLabel>
            <Input type="text" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          </FormControl>
          {editEventId ? (
            <Button leftIcon={<FaEdit />} onClick={updateEvent}>
              Update Event
            </Button>
          ) : (
            <Button leftIcon={<FaPlus />} onClick={createEvent}>
              Create Event
            </Button>
          )}
        </HStack>
        {events.map((event) => (
          <Box key={event.id} borderWidth={1} borderRadius="md" p={4}>
            <Heading size="md">{event.attributes.name}</Heading>
            <Text>{event.attributes.description}</Text>
            <HStack mt={4}>
              <IconButton
                icon={<FaEdit />}
                onClick={() => {
                  setEditEventId(event.id);
                  setEventName(event.attributes.name);
                  setEventDescription(event.attributes.description);
                }}
              />
              <IconButton icon={<FaTrash />} onClick={() => deleteEvent(event.id)} />
            </HStack>
          </Box>
        ))}
        <Button leftIcon={<FaSignOutAlt />} onClick={logout}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Index;
