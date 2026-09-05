import { useEffect, useState } from "react";

export function useApi(path) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: false,
  });
  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: false }));
    fetch(path, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
    })
      .then((response) => {
        if (!response.ok) throw Error("Request failed");
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: true,
          }));
      });
    return () => controller.abort();
  }, [path, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
