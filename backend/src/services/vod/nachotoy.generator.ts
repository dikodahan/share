import { UserException } from "../../user-exception";
import fetch from 'node-fetch';

// Define an interface for the API response
interface ApiResponse {
  message: string;
}

export async function* nachotoyGenerator(
  _: string,
  code: string
): AsyncGenerator<string, void, unknown> {
  if (!code || code === "CODE") {
    throw new UserException("Invalid code", 400);
  }

  const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Cast the response to the ApiResponse type
    const data = (await response.json()) as ApiResponse;

    const videoLink = data.message;

    yield videoLink;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw new UserException("Error fetching video link", 500);
  }
}