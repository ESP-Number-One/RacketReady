import type { ChangeEvent } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface ProfilePicturePickerProps {
  backgroundColor?: string;
}

export function ProfilePicturePicker({
  backgroundColor = "bg-p-grey-100",
}: ProfilePicturePickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);

        // At this point, the image has been read into memory and can be uploaded to a server.
        // You would add your code to upload the image to your backend here.
        // This could be a fetch or axios POST request, for example.
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    setSelectedImage(undefined);
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${backgroundColor}`}
      style={{ width: "100%", paddingTop: "100%" }}
    >
      <div className="absolute inset-0">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Profile"
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleImageClick}
          />
        ) : (
          <label
            htmlFor="fileInput"
            className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
          >
            <FontAwesomeIcon icon={faPlus} size="2x" color="white" />
            <p className="text-white text-2xl font-body font-bold mt-2">
              Profile Picture
            </p>
            <div className="w-full h-full bg-p-gray-200 absolute" />
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
