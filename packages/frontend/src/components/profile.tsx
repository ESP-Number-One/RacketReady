interface ProfPic {
  imgSrc: string;
}

export function Profile({ imgSrc }: ProfPic) {
  return (
    <div className="w-24 h-24 rounded-2xl overflow-hidden">
      <img src={imgSrc} className="w-full h-full object-cover" />
    </div>
  );
}
