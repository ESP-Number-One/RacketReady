import { useContext, useEffect, useState } from "react";
import { type User } from "@esp-group-one/types";
import { API } from "../state/auth";

export function AnotherTestPage() {
  const api = useContext(API);
  const [user, setUser] = useState(undefined as undefined | User);

  useEffect(() => {
    api.user().me().then(setUser).catch(console.warn);
  }, [api]);

  return user !== undefined ? (
    <div className=" bg-red-700">{JSON.stringify(user)}</div>
  ) : (
    <p>Loading</p>
  );
}
