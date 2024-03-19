import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

interface ProfilePicturePickerProps {
  backgroundColor?: string;
  className?: string;
  onChange: (img: string) => void; // Define the onChange prop
  required?: boolean;
}

export function ProfilePicturePicker({
  backgroundColor: backgroundColour = "bg-p-grey-100",
  className = "",
  onChange, // Include the onChange prop in the props interface
  required,
}: ProfilePicturePickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageDataURL = reader.result as string; // Convert the result to a string
          setSelectedImage(imageDataURL);
          onChange(imageDataURL.split(",")[1]); // Call the onChange function with the image data URL
        };
        reader.readAsDataURL(file);
      }
    },
    [setSelectedImage, onChange],
  );

  const handleImageClick = useCallback(() => {
    setSelectedImage(undefined);
    onChange(""); // Call the onChange function with an empty string when the image is cleared
  }, [setSelectedImage, onChange]);

  return (
    <div
      className={twMerge(
        "relative flex items-center justify-center rounded-lg overflow-hidden w-full aspect-square",
        backgroundColour,
        className,
      )}
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
              required={required}
            />
          </label>
        )}
      </div>
    </div>
  );
}
