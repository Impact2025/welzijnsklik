import HelpMeeForm from "./HelpMeeForm";

export default function HelpMeePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Zelf meehelpen</h1>
      <p className="text-gray-500 text-sm">
        Wil je zelf ook een keer meegaan op wandeling, spelletjes spelen of
        gewoon gezelschap houden? Laat het ons weten — de coördinator neemt
        contact met je op.
      </p>
      <HelpMeeForm />
    </div>
  );
}
