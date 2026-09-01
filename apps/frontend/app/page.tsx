export default function Home() {
  return (
    <html lang="fr">
        <body>
            <h1>GeoEmploi</h1>
            <p>Bienvenue sur GeoEmploi</p>
            <div style={{ fontSize: "12px", color: "gray" }}>
                Port: {process.env.PORT}
            </div>
        </body>
    </html>
  );
}
