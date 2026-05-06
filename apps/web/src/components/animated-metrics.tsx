"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedMetricsProps = {
  metrics: Array<{
    value: number;
    label: string;
  }>;
  locale?: string;
};

export function AnimatedMetrics({ metrics, locale = "ru-RU" }: AnimatedMetricsProps) {
  return (
    <section className="rounded border border-ink/10 bg-white p-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <AnimatedMetric
            key={metric.label}
            value={metric.value}
            label={metric.label}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function AnimatedMetric({
  value,
  label,
  locale
}: {
  value: number;
  label: string;
  locale: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || hasStarted) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(value);
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setHasStarted(true);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasStarted, value]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const durationMs = 1250;
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [hasStarted, value]);

  return (
    <div ref={ref} className="min-w-0">
      <p className="text-5xl font-semibold leading-none text-ink md:text-6xl">
        {formatter.format(count)}
      </p>
      <p className="mt-4 max-w-56 text-base leading-6 text-ink/75">{label}</p>
    </div>
  );
}
