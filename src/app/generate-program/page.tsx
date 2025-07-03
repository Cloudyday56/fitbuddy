"use client";
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi';

const GenerateProgramPage = () => {

  const [callActive, setCallActive] = useState(false); //check the call
  const [connecting, setConnecting] = useState(false); //check connecting
  const [isSpeaking, setIsSpeaking] = useState(false); //for is AI speaking
  const [messages, setMessages] = useState([]); //for displaying what user and AI say
  const [callEnded, setCallEnded] = useState(false); //check if call ended

  const {user} = useUser(); //get user data
  const router = useRouter(); //for navigation
  
  const messageContainerRef = useRef<HTMLDivElement>(null); //to scroll the msgs

  //scroll to the bottom of the message container
  useEffect(() => {
    if (messageContainerRef.current) { //if has ref
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]) //runs whenever messages change

  //navigate to home after call ended
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile"); //navigate to home after 1.5 seconds
      }, 1500);

      return () => clearTimeout(redirectTimer); //cleanup the timer on unmount
    }
  }, [callEnded, router]); //runs whenever callEnded changes

  //use vapi to make the call
  useEffect(() => {
    //at start
    const handleCallStart = () => {
      console.log("Call started");
      setCallActive(true);
      setConnecting(true);
      setCallEnded(false);
    }
    //at end
    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    }
    //speak
    const handleSpeechStart = () => {
      console.log("AI is speaking");
      setIsSpeaking(true);
    }
    //stop speaking
    const handleSpeechEnd = () => {
      console.log("AI stopped speaking");
      setIsSpeaking(false);
    }
    //script
    const handleMessage = (message: string) => {

    }
    //error
    const handleError = (error: Error) => {
      console.error("Error in VAPI:", error);
      setConnecting(false);
      setCallActive(false);
    }

    vapi.on("call-start", handleCallStart)
        .on("call-end", handleCallEnd)
        .on("speech-start", handleSpeechStart)
        .on("speech-end", handleSpeechEnd)
        .on("message", handleMessage) //transcript
        .on("error", handleError);
    
    // cleanup the event listeners on unmount
    return () => {
      vapi.off("call-start", handleCallStart)
          .off("call-end", handleCallEnd)
          .off("speech-start", handleSpeechStart)
          .off("speech-end", handleSpeechEnd)
          .off("message", handleMessage)
          .off("error", handleError);
    };
  }, [])

  //call button toggle
  const toggleCall = async () => {
    if (callActive) vapi.stop()
    else {
    try {
      setConnecting(true);
      setMessages([]); //clear messages on new call
      setCallEnded(false); //reset call ended state

      //start the call with vapi
      const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "There"; //get full name from user data
      await vapi.start("552203fc-117d-44a9-814a-2dde42494ddc",{
        variableValues:{
          full_name: fullName, //the variable setup in vapi workflow
          // todo: send user id
        }
      });
    } catch (error) {
      console.log("Error starting call:", error);
      setConnecting(false);
    }
}
  }

  return (
    <div>GenerateProgramPage
    
    </div>
  )
}

export default GenerateProgramPage