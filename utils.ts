type Timer = ReturnType<typeof setTimeout>;

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timer: Timer | undefined;

  return function debouncedFunction(this: any, ...args: Parameters<F>): void {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      func.apply(this, args);
      timer = undefined;
    }, delay);
  };
}
