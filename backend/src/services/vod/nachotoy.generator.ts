import { UserException } from "../../user-exception";
import fetch from 'node-fetch';

interface ApiResponse {
  message: string;
}

// Asynchronous function to fetch data
async function fetchData(code: string): Promise<string> {
  if (!code || code === "CODE") {
    throw new UserException("Invalid code", 400);
  }

  const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = (await response.json()) as ApiResponse;
  return data.message;
}

// Synchronous generator function
export function* nachotoyGenerator(
  _: string,
  code: string
): Generator<Promise<string>, void, unknown> {
  yield fetchData(code);
}