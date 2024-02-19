import { useState } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface StepContent3Props {
  allImages: string[];
  changeBackground: (image: string) => void;
}

const StepContent3: React.FC<StepContent3Props> = ({
  allImages,
  changeBackground,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [layoutFilter, setLayoutFilter] = useState<string>("basic");

  const handleOptionClick = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    changeBackground(allImages[optionIndex]);
  };

  const handleLayoutChange = (
    event: React.MouseEvent<HTMLElement>,
    newLayout: string,
  ) => {
    if (newLayout !== null) {
      setLayoutFilter(newLayout);
    }
  };

  return (
    <>
      <h1 className="flex pb-7 pt-12 text-xl font-light">Customize Backdrop</h1>
      <div className="flex max-h-[calc(100vh-21rem)] flex-col items-center space-y-2 py-4">
        <ToggleButtonGroup
          color="primary"
          value={layoutFilter}
          exclusive
          onChange={handleLayoutChange}
          aria-label="Platform"
          className="-mt-5 pb-5"
        >
          <ToggleButton value="all">all</ToggleButton>
          <ToggleButton value="basic">basic</ToggleButton>
          <ToggleButton value="colorful">colorful</ToggleButton>
        </ToggleButtonGroup>
        {allImages.map((url, index) => (
          <div
            key={index}
            className={`flex cursor-pointer flex-col items-center rounded-lg border border-gray-100 bg-white p-1 ${
              selectedOption === index ? "border-blue-500" : ""
            }`}
            onClick={() => handleOptionClick(index)}
            style={{ minWidth: "250px" }}
          >
            <div className="h-20 overflow-hidden rounded-md">
              <Image
                src={url}
                alt={`Background ${index + 1}`}
                width={300}
                height={300}
                // objectFit="contain"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StepContent3;
