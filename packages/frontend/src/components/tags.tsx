interface Tagging {
  sportName: string;
}

export function Tag({ sportName }: Tagging) {
  return (
    <div
      className={`inline-block rounded-full py-1 px-6 font-bold font-title text-white text-lg ${getSportColorClass(
        sportName,
      )}`}
    >
      {sportName}
    </div>
  );
}

const getSportColorClass = (sportName: string) => {
  switch (sportName.toLowerCase()) {
    case "badminton":
      return "bg-badminton-teal";
    case "tennis":
      return "bg-tennis-green";
    case "squash":
      return "bg-squash-yellow";
  }
};

export default Tag;
