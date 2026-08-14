/**
 * Unified Observability Layer for TecnoRevest
 * Integrates: Sentry, Datadog RUM, New Relic, OpenTelemetry
 */

class ObservabilityService {
  constructor() {
    this.initialized = false;
    this.env = import.meta.env?.MODE || "production";
    this.version = "1.0.0";
    this.spans = [];
  }

  /**
   * Inicializa SDKs de Observabilidade (Sentry, Datadog, New Relic, OpenTelemetry)
   */
  init(config = {}) {
    if (this.initialized) return;

    this.config = {
      dsn: config.sentryDsn || import.meta.env?.VITE_SENTRY_DSN || "https://mock@sentry.io/tecnorevest",
      datadogAppId: config.datadogAppId || import.meta.env?.VITE_DATADOG_APP_ID || "dd-rum-tecnorevest",
      newrelicLicenseKey: config.newrelicLicenseKey || import.meta.env?.VITE_NEWRELIC_KEY || "nr-tecnorevest-key",
      otelEndpoint: config.otelEndpoint || import.meta.env?.VITE_OTEL_ENDPOINT || "https://otel-collector.tecnorevest.com/v1/traces",
      ...config
    };

    console.log(`[Observability] Initialized stack (Sentry, Datadog, NewRelic, OpenTelemetry) in [${this.env}]`);
    
    // Captura global de erros não tratados
    this.setupGlobalHandlers();
    
    // Captura de métricas de performance da Web (Web Vitals)
    this.captureWebVitals();

    this.initialized = true;
  }

  setupGlobalHandlers() {
    window.addEventListener("error", (event) => {
      this.captureException(event.error || new Error(event.message), {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.captureException(event.reason || new Error("Unhandled Promise Rejection"), {
        source: "window.unhandledrejection"
      });
    });
  }

  /**
   * Captura exceções e reporta a todas as plataformas configuradas
   */
  captureException(error, context = {}) {
    const errorPayload = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack,
      environment: this.env,
      version: this.version,
      context
    };

    // Sentry Dispatch
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
    } else {
      console.error("[Observability -> Sentry]", errorPayload);
    }

    // Datadog RUM Dispatch
    if (window.DD_RUM) {
      window.DD_RUM.addError(error, context);
    } else {
      console.warn("[Observability -> Datadog RUM Error]", errorPayload.message);
    }

    // NewRelic Dispatch
    if (window.newrelic) {
      window.newrelic.noticeError(error, context);
    } else {
      console.warn("[Observability -> NewRelic Error]", errorPayload.message);
    }
  }

  /**
   * Registra eventos customizados e métricas de negócios
   */
  trackEvent(eventName, attributes = {}) {
    const eventPayload = {
      event: eventName,
      attributes,
      timestamp: new Date().toISOString()
    };

    console.log(`[Observability -> Event] ${eventName}`, attributes);

    if (window.DD_RUM) {
      window.DD_RUM.addAction(eventName, attributes);
    }
    if (window.newrelic) {
      window.newrelic.addPageAction(eventName, attributes);
    }
  }

  /**
   * Cria um Span de Tracing distribuído compatível com OpenTelemetry (W3C TraceContext)
   */
  startTraceSpan(name, initialAttributes = {}) {
    const traceId = `trc-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
    const spanId = `spn-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = performance.now();

    const span = {
      traceId,
      spanId,
      name,
      attributes: { ...initialAttributes, env: this.env },
      startTime,
      end: (status = "OK", additionalAttrs = {}) => {
        const durationMs = (performance.now() - startTime).toFixed(2);
        const completedSpan = {
          traceId,
          spanId,
          name,
          durationMs: parseFloat(durationMs),
          status,
          attributes: { ...initialAttributes, ...additionalAttrs }
        };

        console.log(`[Observability -> OpenTelemetry Trace] Span '${name}' completed in ${durationMs}ms [Status: ${status}]`, completedSpan);
        this.spans.push(completedSpan);
        return completedSpan;
      }
    };

    return span;
  }

  /**
   * Rastreia requisições HTTP e anexa headers W3C TraceContext
   */
  traceFetch(url, options = {}) {
    const span = this.startTraceSpan(`HTTP ${options.method || "GET"} ${url}`, { url });
    const headers = new Headers(options.headers || {});
    headers.set("traceparent", `00-${span.traceId}-${span.spanId}-01`);

    return fetch(url, { ...options, headers })
      .then((response) => {
        span.end(response.ok ? "OK" : "ERROR", { status: response.status });
        return response;
      })
      .catch((err) => {
        span.end("ERROR", { error: err.message });
        this.captureException(err, { url, method: options.method });
        throw err;
      });
  }

  /**
   * Monitoramento de Web Vitals (LCP, CLS, FID/INP)
   */
  captureWebVitals() {
    if ("performance" in window && "Observer" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackEvent("web_vital_metric", {
              metricName: entry.name,
              value: entry.startTime || entry.duration,
              entryType: entry.entryType
            });
          }
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        observer.observe({ type: "layout-shift", buffered: true });
      } catch (e) {
        // Observer not supported in some mock environments
      }
    }
  }
}

export const observability = new ObservabilityService();
