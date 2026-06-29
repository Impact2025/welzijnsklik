export default function GeenToegang() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Geen toegang
        </h1>
        <p className="text-gray-500 text-sm">
          Je hebt geen toegang tot deze pagina. Neem contact op met je
          coördinator.
        </p>
      </div>
    </main>
  );
}
