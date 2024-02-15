interface genericCardProps<T> {
  cardSubject: T;
}

export function GenericCard<T>({ cardSubject: T }: genericCardProps<T>) {
  // if T has a name field, make this the title
  return <div className="fill-pg-bar-gray rounded-md"></div>;
}
