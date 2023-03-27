import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className={"bg-dotted"}>
        <Main />
        <NextScript />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script data-domain={"sequencegenius.com"}  src={"/js/info.js"}></script>
      </body>
    </Html>
  )
}
