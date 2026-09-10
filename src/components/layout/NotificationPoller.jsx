"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function NotificationPoller() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to notification server via WebSocket.");
    });

    socket.on("newAccessRequest", (data) => {
      // Show toast notification
      toast("New Access Request Received!", {
        icon: "🔔",
        duration: 6000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontWeight: '500'
        },
      });

      // Play a nice notification sound
      playNotificationSound();
      
      // Invalidate requests list so the UI updates
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["latest-request"]);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      
      // First chime
      playTone(audioCtx, 880, 0, 0.2); // A5
      // Second chime
      playTone(audioCtx, 1046.50, 0.2, 0.4); // C6
      
    } catch (e) {
      console.warn("Audio play failed, likely blocked by browser:", e);
    }
  };
  
  const playTone = (audioCtx, frequency, startTimeOffset, duration) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    
    const startTime = audioCtx.currentTime + startTimeOffset;
    
    // Envelope for a smooth "ding"
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  return null; // Invisible component
}
