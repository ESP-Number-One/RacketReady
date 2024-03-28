import type { SportInfo, UserCreation } from "@esp-group-one/types";
import type { ReactNode } from "react";
import { useCallback, useContext, useState } from "react";
import { useAsync } from "../../lib/async";
import { API } from "../../state/auth";
import { Form } from "../../components/form";
import { Header } from "../../components/page/header";
import { ProfilePicturePicker } from "../../components/form/profile_picture";
import { Input } from "../../components/form/input";
import { useViewNav } from "../../state/nav";
import { SportsAddMenu } from "../../components/sports_add_menu";
import { Link } from "../../components/link";

export function EditUser() {
  const api = useContext(API);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pic, setPic] = useState<string | undefined>();

  const viewNav = useViewNav();

  const { loading, error, ok } = useAsync(async () => {
    const user = await api.user().me();

    setEmail(user.email);
    setName(user.name);
    setDescription(user.description);

    return { user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  const onSubmit = useCallback(async () => {
    const req: Partial<UserCreation> = {};

    if (email && email !== ok?.user.email) req.email = email;
    if (description && description !== ok?.user.description)
      req.description = description;
    if (name && name !== ok?.user.name) req.name = name;
    if (pic && pic !== ok?.user.profilePicture) req.profilePicture = pic;

    if (Object.keys(req).length === 0) throw new Error("Nothing has changed");

    await api
      .user()
      .editMe(req)
      .then(() => {
        viewNav("/");
      });
    await api.user().me();
  }, [api, ok, email, name, description, pic]);

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>
        <Header.Back defaultLink="/me" />
        Edit Me
      </Form.Header>
      <Form.Body>
        <ProfilePicturePicker onChange={setPic} />
        <Input
          value={name}
          onChange={setName}
          placeholder="Enter your name"
          type="text"
        />

        <Input
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          type="text"
        />

        <Input
          value={description}
          onChange={setDescription}
          placeholder="Give a description of yourself"
          type="textarea"
        />

        <Link href="/me/sports/edit">
          <div className="rounded-lg w-full text-xl bg-p-grey-200 pl-3 text-white font-bold">
            Edit sports
          </div>
        </Link>
      </Form.Body>
    </Form>
  );
}

export function EditSports() {
  const api = useContext(API);
  const [sports, setSports] = useState<SportInfo[]>([]);

  const onSubmit = useCallback(async () => {
    if (sports.length === 0)
      throw new Error("You must have picked at least one sport!");

    await api.user().addSports(...sports);
  }, [sports]);

  const { loading, error, ok } = useAsync(async () => {
    const user = await api.user().me();

    setSports(user.sports);

    return { user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>
        <Header.Back defaultLink="/me/edit" />
        Edit sports
      </Form.Header>
      <Form.Body>
        <SportsAddMenu sports={sports} setSports={setSports} />
      </Form.Body>
    </Form>
  );
}
