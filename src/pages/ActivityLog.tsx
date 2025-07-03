// src/components/ActivityLog.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivityLogs } from "../features/slices/activitySlice";
import type { RootState, AppDispatch } from "../features/store/store";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import moment from "moment";

interface Props {
  projectId: string;
}

const ActivityLog: React.FC<Props> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error } = useSelector(
    (state: RootState) => state.activity
  );

  console.log(logs);

  useEffect(() => {
    dispatch(fetchActivityLogs(projectId));
  }, [dispatch, projectId]);

  return (
    <Box>
      {loading && <CircularProgress size={24} />}
      {error && <Typography color="error">{error}</Typography>}

      <List>
        {logs.map((log) => (
          <ListItem key={log._id}>
            <ListItemText
              primary={`(${log.user.role}) - ${log.user.email} - ${log.action}`}
              secondary={moment(log.createdAt).fromNow()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ActivityLog;
