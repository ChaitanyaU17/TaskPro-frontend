import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../features/store/store";
import socket from "../socket";

const OnlineUsers: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const userEmail = useSelector((state: RootState) => state.auth.email);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      socket.emit("user-online", userId);
    }

    socket.on("online-users", (users: string[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };
  }, [userId]);

  return (
    <Box mb={2}>
      <Box display="flex" justifyContent="left" alignItems="center" gap={1}>
        <Typography variant="subtitle2" mt={0.5} fontSize={17} fontWeight={600}>
          🟢 Online Users:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
          {onlineUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No users online
            </Typography>
          ) : (
            onlineUsers.map((email) => (
              <Chip
                key={email}
                label={email === userEmail ? "You" : email}
                color={email === userEmail ? "primary" : "success"}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OnlineUsers;
