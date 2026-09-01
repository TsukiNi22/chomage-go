export default function Home() {
  return (
    <main>
      <h1>GeoEmploi</h1>
      <p>Bienvenue sur GeoEmploi</p>
      <p style={{ fontSize: "12px", color: "gray" }}>
        Port: {process.env.PORT}
      </p>
    </main>
  );
}
