export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            // Jaeger is currently disabled due to Thrift file resolution issues in Next.js 16/Webpack 5
            // console.log('✅ Next.js Instrumentation: Skip Jaeger initialization to avoid ENOENT errors');

            /* 
            const { NodeTracerProvider } = await import('@opentelemetry/sdk-trace-node');
            const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
            const { Resource } = await import('@opentelemetry/resources');
            const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');

            const provider = new NodeTracerProvider({
                resource: new Resource({
                    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'adaptiq-lms',
                    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
                }),
            });
            provider.register();
            */

            console.log('✅ Next.js Instrumentation: Initialized (Telemetry quiet)');
        } catch (error) {
            console.error('❌ Next.js Instrumentation Error:', error);
        }
    }
}
