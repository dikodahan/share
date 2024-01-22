import { UserException } from "../../user-exception";
import fetch from 'node-fetch';

interface ApiResponse {
  message: string;
}

// Exported asynchronous generator function to fetch data
export async function* nachotoyAsyncGenerator(
  password: string
): AsyncGenerator<string, void, unknown> {
  if (!password || password === "CODE") { // Assuming 'username' is the correct variable
    throw new UserException("Invalid code", 400);
  }

  const apiUrl = `https://nachotoy.com/api/videoLink/${password}/0/0/1`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = (await response.json()) as ApiResponse;
  yield data.message; // Use 'yield' instead of 'return'
}
