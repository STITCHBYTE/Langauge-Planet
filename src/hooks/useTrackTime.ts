import { useEffect, useRef } from "react";
import Server_url from "../config";

const useTrackTime = ({ activityType, activityId, userId }) => {
  const lastVisibleTime = useRef(Date.now());
  const totalActiveTime = useRef(0);

  const flushTime = () => {
    const now = Date.now();
    // Always accumulate up to the moment of flush
    if (!document.hidden) {
      totalActiveTime.current += now - lastVisibleTime.current;
      lastVisibleTime.current = now;
    }
    const payload = {
      activity_type: activityType,
      activity_id: activityId,
      active_seconds: Math.floor(totalActiveTime.current / 1000),
      // user_id: userId
    };

    const token = localStorage.getItem('authToken');
    console.log("[useTrackTime] Flushing time:", {
      now,
      lastVisibleTime: lastVisibleTime.current,
      totalActiveTime: totalActiveTime.current,
      payload,
      token
    });

    fetch(`${Server_url}/api/users/activity/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(res => {
      console.log("[useTrackTime] Activity sent, status:", res.status);
    }).catch(err => {
      console.error("[useTrackTime] Activity send error:", err);
    });
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Pause timer, but do NOT send request
        totalActiveTime.current += now - lastVisibleTime.current;
        console.log("[useTrackTime] Tab hidden. Timer paused. Added to totalActiveTime:", now - lastVisibleTime.current, "New total:", totalActiveTime.current);
      } else {
        // Resume timer from now
        lastVisibleTime.current = now;
        console.log("[useTrackTime] Tab visible. lastVisibleTime updated:", now);
      }
    };

    console.log("[useTrackTime] Effect mounted", { activityType, activityId, userId });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", flushTime);
    return () => {
      console.log("[useTrackTime] Effect cleanup (unmount or deps change)");
      flushTime();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", flushTime);
    };
  }, [activityType, activityId, userId]);
};

export default useTrackTime;