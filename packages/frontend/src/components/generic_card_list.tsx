import { ReactNode } from "react";
import { GenericCard } from "./generic_card";

interface cardListProps<T> {
  cardSubjects: T[];
}

export function GenericCardList<T>({ cardSubjects }: cardListProps<T>) {
  const cards: ReactNode[] = [];
  cardSubjects.forEach((cardSubject, _v, _arr) => {
    cards.concat(GenericCard<T>({ cardSubject }));
  });

  return <div>{cards}</div>;
}
