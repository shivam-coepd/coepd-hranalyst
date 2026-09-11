type Props = {
  label:
    string;
  value:
    string | number;
  helper?:
    string;
};

export function
KpiCard({
  label,
  value,
  helper,
}: Props) {

  return (
    <div className="rounded-xl border bg-white p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      {helper && (
        <p className="mt-1 text-xs text-gray-500">
          {helper}
        </p>
      )}

    </div>
  );
}