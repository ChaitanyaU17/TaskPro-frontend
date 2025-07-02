/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import socket from "../socket";
import { Typography, Box } from "@mui/material";

interface Props {
  taskId: string;
}

const TaskEditingTracker: React.FC<Props> = ({ taskId }) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    const handleEditing = ({ taskId: editingTaskId, userId }: any) => {
      if (editingTaskId === taskId) {
        setEditingUser(userId);
      }
    };

    const handleStopEditing = ({ taskId: editingTaskId }: any) => {
      if (editingTaskId === taskId) {
        setEditingUser(null);
      }
    };

    socket.on("editing-tasks", handleEditing);
    socket.on("stop-editing-task", handleStopEditing);

    return () => {
      socket.off("editing-tasks", handleEditing);
      socket.off("stop-editing-task", handleStopEditing);
    };
  }, [taskId]);

  if (!editingUser) return null;

  return (
    <Box mt={1}>
      <Typography variant="caption" color="warning.main">
        ✏️ Being edited by {editingUser}
      </Typography>
    </Box>
  );
};

export default TaskEditingTracker;
