import type { ChangeEvent } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface ProfilePicturePickerProps {
  backgroundColor?: string;
  onChange: (img: string) => void; // Define the onChange prop
}

export function ProfilePicturePicker({
  backgroundColor = "bg-p-grey-100",
  onChange, // Include the onChange prop in the props interface
}: ProfilePicturePickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataURL = reader.result as string; // Convert the result to a string
        setSelectedImage(imageDataURL);
        onChange(imageDataURL); // Call the onChange function with the image data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    setSelectedImage(undefined);
    onChange(""); // Call the onChange function with an empty string when the image is cleared
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${backgroundColor} w-full aspect-w-1 aspect-h-1`}
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
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
