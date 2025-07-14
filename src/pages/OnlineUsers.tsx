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
      if (
        userId &&
        userId !== "undefined" &&
        userEmail &&
        userEmail !== "undefined"
      ) {
        socket.emit("user-online", { userId, email: userEmail });
      }
    };

    connectAndEmit();

    socket.on("online-users", (users: { userId: string; email: string }[]) => {
      const filtered = users.filter(
        (u) =>
          u.userId &&
          u.userId !== "undefined" &&
          u.email &&
          u.email !== "undefined"
      );
      setOnlineUsers(filtered);
    });

    return () => {
      socket.off("online-users");
    };
  }, [userId, userEmail]);

  return (
    <Box display="flex" alignItems="center">
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: "success.main",
          }}
        />

        <Typography
          variant="subtitle2"
          fontSize={15}
          fontWeight={600}
          color="success.main"
        >
          Online
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" ml={1} gap={1}>
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
              size="small"
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default OnlineUsers;
