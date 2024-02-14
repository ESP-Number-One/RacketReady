interface Tagging {
  sportName: string;
}

export function Tag({ sportName }: Tagging) {
  return (
    <div
      className={`inline-block rounded-full py-1 px-5 font-bold font-title text-white text-md ${getSportColorClass(
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
      return "bg-badminton";
    case "tennis":
      return "bg-tennis";
    case "squash":
      return "bg-squash";
  }
};
