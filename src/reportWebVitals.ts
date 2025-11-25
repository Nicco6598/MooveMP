import { onCLS, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

type ReportCallback = (metric: Metric) => void;

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
