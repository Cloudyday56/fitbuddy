import Vapi from "@vapi-ai/web";

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!); 
// api key from .env.local (! is to assert that the value is not null or undefined)
