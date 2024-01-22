type FetchDataFunction = (code: string) => Promise<string>;

export async function* asyncVodGenerator(
  fetchDataFunction: FetchDataFunction,
  _: string,
  code: string
): AsyncGenerator<string, void, unknown> {
  yield await fetchDataFunction(code);
}
