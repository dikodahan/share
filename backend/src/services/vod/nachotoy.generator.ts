import Nachotoy from "./nachotoy.json";
import { UserException } from "../../user-exception";

export function* nachotoyGenerator(
    _: string,
    code: string
  ): Generator<string, void, unknown> {
    if (!code || code == "CODE") {
      throw new UserException("Invalid code", 400);
    }

}