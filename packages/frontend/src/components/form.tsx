/* eslint-disable -- wejfhbew*/
import { FormEvent, useState } from "react";

interface FormData {
  username: string;
  password: string;
}

interface Props {
  onSubmit: () => Promise<void>;
}

export function Form({ onSubmit }: Props) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(`The name you entered was: ${formData.username}`);
    alert(`The name you entered was: ${formData.password}`);
    onSubmit().catch((e) => setError(e));
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      <div className="">{error}</div>
      <label style={{ paddingBottom: "3px" }}>Enter your username:</label>
      <br />
      <input
        style={{
          border: "1.5px solid black",
          borderRadius: "4px",
          paddingLeft: "8px",
        }}
        className="border-black"
        name="username"
        type="text"
        boarder-black
        value={formData.username}
        placeholder="Enter your username"
        onChange={handleChange}
      />
      <br />
      <label>Enter your password:</label>
      <br />
      <input
        style={{
          border: "1.5px solid black",
          borderRadius: "4px",
          paddingLeft: "8px",
        }}
        name="password"
        type="text"
        boarder-black
        value={formData.password}
        placeholder="Enter your password"
        onChange={handleChange}
      />
      <br />
      <div style={{ paddingTop: "10px" }}>
        <input
          type="submit"
          style={{
            backgroundColor: "green",
            borderRadius: "3px",
            padding: "5px",
            color: "white",
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingTop: "10px",
            paddingBottom: "8px",
          }}
        />
      </div>
    </form>
  );
}
