// OnlineUsers.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../features/store/store";
import socket, { socketConnectPromise } from "../socket";

const OnlineUsers: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const userEmail = useSelector((state: RootState) => state.auth.email);
  const [onlineUsers, setOnlineUsers] = useState<
    { userId: string; email: string }[]
  >([]);

  useEffect(() => {
    const connectAndEmit = async () => {
      await socketConnectPromise;
      if (userId && userEmail) {
        socket.emit("user-online", { userId, email: userEmail });
      }
    };

    connectAndEmit();

    socket.on("online-users", (users: { userId: string; email: string }[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };
  }, [userId, userEmail]);

  return (
    <Box mb={2}>
      <Box display="flex" justifyContent="left" alignItems="center" gap={1}>
        <Typography variant="subtitle2" mt={0.5} fontSize={17} fontWeight={600}>
          Online Users:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
          {onlineUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No users online
            </Typography>
          ) : (
            onlineUsers.map((user) => (
              <Chip
                key={user.userId}
                label={user.email === userEmail ? "You" : user.email}
                color={user.email === userEmail ? "primary" : "success"}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OnlineUsers;
