/** Scroll metrics of a horizontally scrolling carousel track (an HTMLElement satisfies this). */
export type CarouselScrollMetrics = {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
};

/** Slack in px so sub-pixel rounding at either end still counts as "at the edge". */
const EDGE_TOLERANCE = 8;

/** Whether the track can scroll further back or forward from its current position. */
export function carouselEdges({
  scrollLeft,
  clientWidth,
  scrollWidth,
}: CarouselScrollMetrics): {
  canScrollBack: boolean;
  canScrollForward: boolean;
} {
  return {
    canScrollBack: scrollLeft > EDGE_TOLERANCE,
    canScrollForward: scrollLeft + clientWidth < scrollWidth - EDGE_TOLERANCE,
  };
}

/** Next auto-advance position: one visible width forward, wrapping to the start at the end. */
export function nextAutoAdvanceLeft(metrics: CarouselScrollMetrics): number {
  return carouselEdges(metrics).canScrollForward
    ? metrics.scrollLeft + metrics.clientWidth
    : 0;
}
