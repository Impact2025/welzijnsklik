export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Check je inbox
        </h1>
        <p className="text-gray-500 text-sm">
          We hebben je een e-mail gestuurd met een inloglink. De link is 24 uur
          geldig.
        </p>
      </div>
    </main>
  );
}
