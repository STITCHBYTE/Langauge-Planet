import { useEffect, useRef } from "react";
import Server_url from "../config";

const useTrackTime = ({ activityType, activityId, userId }) => {
  const lastVisibleTime = useRef(Date.now());
  const totalActiveTime = useRef(0);

  const flushTime = () => {
    const now = Date.now();
    if (!document.hidden) {
      totalActiveTime.current += now - lastVisibleTime.current;
      lastVisibleTime.current = now;
    }
    const payload = {
      activity_type: activityType,
      activity_id: activityId,
      active_seconds: Math.floor(totalActiveTime.current / 1000),
    };

    const token = localStorage.getItem('authToken');

    fetch(`${Server_url}/api/users/activity/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(res => {
    }).catch(err => {
    });
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Pause timer, but do NOT send request
        totalActiveTime.current += now - lastVisibleTime.current;
       } else {
        // Resume timer from now
        lastVisibleTime.current = now;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", flushTime);
    return () => {
      flushTime();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", flushTime);
    };
  }, [activityType, activityId, userId]);
};

export default useTrackTime;