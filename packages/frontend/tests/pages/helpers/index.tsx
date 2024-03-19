import { type ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export function PageTester(props: {
  route: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <MemoryRouter initialEntries={[props.path]}>
      <Routes>
        <Route path={props.route} element={props.children} />
      </Routes>
    </MemoryRouter>
  );
}
