import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfilePicturePicker } from "../../../src/components/form/profile_picture";

describe("ProfilePicturePicker", () => {
  test("displays selected image", async () => {
    const handleChange = (): void => {
      throw new Error("Function not implemented.");
    };

    const { getByLabelText, getByAltText } = render(
      <ProfilePicturePicker onChange={handleChange} />,
    );

    // Simulate selecting an image
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    const input = getByLabelText("Profile Picture");
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the image element to appear in the document
    await waitFor(() => {
      const imgElement = getByAltText("Profile");
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute(
        "src",
        expect.stringContaining("data:image/png;base64"),
      );
    });
  });
});
