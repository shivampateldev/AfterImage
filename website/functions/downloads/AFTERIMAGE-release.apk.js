export async function onRequest(context) {
  const url = new URL(context.request.url);
  const origin = url.origin;

  // Stream each part sequentially and concatenate into a single continuous stream
  const { readable, writable } = new TransformStream();

  context.waitUntil((async () => {
    try {
      const resp1 = await context.env.ASSETS.fetch(new URL('/downloads/AFTERIMAGE.part1', origin));
      const resp2 = await context.env.ASSETS.fetch(new URL('/downloads/AFTERIMAGE.part2', origin));

      if (!resp1.ok || !resp2.ok) {
        throw new Error('Failed to fetch APK parts');
      }

      const writer = writable.getWriter();
      
      const reader1 = resp1.body.getReader();
      while (true) {
        const { done, value } = await reader1.read();
        if (done) break;
        await writer.write(value);
      }

      const reader2 = resp2.body.getReader();
      while (true) {
        const { done, value } = await reader2.read();
        if (done) break;
        await writer.write(value);
      }

      await writer.close();
    } catch (err) {
      try {
        await writable.abort(err);
      } catch {}
    }
  })());

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="AFTERIMAGE-The-Last-Echo-release.apk"',
      'Content-Length': '37883867',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
