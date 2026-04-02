jsximport Head from 'next/head'
import App from '../components/App'

export default function Home() {
  return (
    <>
      <Head>
        <title>Jocelyn's Daily Chart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
      </Head>
      <App />
    </>
  )
}
