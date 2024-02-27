export function VersusMatchCard(props: { score: Record<string, number> }) {
  const [firstKey, secondKey] = Object.keys(props.score);
  const firstValue = props.score[firstKey];
  const secondValue = props.score[secondKey];
  return (
    <div className="bg-gray-400 text-center w-min rounded-lg text-white overflow-hidden">
      <div
        className={`${
          firstValue <= secondValue ? "bg-p-green-200" : ""
        } flex justify-between whitespace-nowrap text-xl font-bold items-center`}
      >
        <p className="m-2">{firstKey} </p>
        <p className="ml-2 p-2">{firstValue}</p>
      </div>
      <div className="grid grid-cols-3 items-center">
        <div className="bg-white h-1" />
        <p className="leading-[0]">vs</p>
        <div className="bg-white h-1" />
      </div>
      <div
        className={`${
          firstValue <= secondValue ? "bg-p-green-200" : ""
        } flex justify-between whitespace-nowrap text-xl font-bold items-center`}
      >
        <p className="m-2">{secondKey} </p>
        <p className="ml-2 p-2">{secondValue}</p>
      </div>
    </div>
  );
}
