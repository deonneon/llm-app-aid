import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import { Button, MenuItem, Select, Typography, Box } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface StepContent1Props {
  setTopic: (topic: string) => void;
  setActiveFormat: (format: number) => void;
  activeFormat: number;
  setAudience: (audience: string) => void;
  setStandards: (fontType: string) => void;
  standards: string;
}

const Standards = [
  "---",
  "Common Core State Standard for Mathematics (CCSS)",
  "Common Core State Standard for English Language (CCSS)",
  "Common Core State Standard for Arts (CCSS)",
  "State Standards",
  "Programme for International Student Assessment (PISA)",
  "Career and Technical Education (CTE)",
];

const StepContent1: React.FC<StepContent1Props> = ({
  setTopic,
  setActiveFormat,
  activeFormat,
  setAudience,
  setStandards,
  standards,
}) => {
  const [selectedStandards, setSelectedStandards] = useState<string>(
    Standards[0],
  );

  const handleStandardTypeChange = (event: SelectChangeEvent) => {
    const newStandard = event.target.value;
    setSelectedStandards(newStandard);
    setStandards(newStandard);
  };

  const handleOptionClick = (index: number) => {
    setActiveFormat(index);
  };

  //for tool tip
  const [showTooltip, setShowTooltip] = useState(false);
  const handleIconClick = () => {
    setShowTooltip(!showTooltip);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowTooltip(false);
    };

    if (showTooltip) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <>
      <h1 className=" flex pb-7 pt-12 text-xl font-light">
        Start with a topic
      </h1>
      <div className="group relative w-full flex-1">
        <TextField
          id="outlined-multiline-static"
          label="Be specific"
          multiline
          rows={2}
          placeholder="The wordier the better!"
          className="w-full text-opacity-50"
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="absolute right-3 top-1">
          <Tooltip
            title="The quality of the questions on the worksheet will depend on how desciptive you are."
            open={showTooltip}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <InfoOutlinedIcon
              className="cursor-pointer text-xl text-gray-500"
              onClick={handleIconClick}
            />
          </Tooltip>
        </div>
      </div>

      {/* <div className="flex w-full flex-row items-center justify-between ">
        <div className="text-sm">Audience</div>
        <TextField
          id="outlined-basic"
          label=""
          disabled
          variant="outlined"
          placeholder="Be specific"
          className="w-25 ml-10 mt-5 text-opacity-50"
          onChange={(e) => setAudience(e.target.value)}
        />
      </div> */}
      {/* Question Format options */}
      <div className="max-h-[calc(100vh-27rem)] w-full flex-1 space-y-2 py-4">
        <h3>Question Format</h3>
        {[
          "Text Responses",
          "Fill in the Blank",
          "Multiple Choices",
          "True or False",
        ].map((option, index) => (
          <div
            key={index}
            className={`flex items-center rounded-lg border p-4 ${
              activeFormat === index ? "border-gray-700" : "border-gray-100"
            } group relative cursor-pointer`}
            onClick={() => handleOptionClick(index)}
          >
            <div className="text-sm">{option}</div>
            <div
              className={`${
                activeFormat === index
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              } absolute right-3 top-1 transition-opacity`}
            >
              <InfoOutlinedIcon className="text-xl text-gray-500 " />
            </div>
          </div>
        ))}
      </div>
      <Box className="flex w-full flex-col justify-between space-y-4">
        <Typography>Teacher Testing Standard</Typography>
        <Select
          value={selectedStandards}
          onChange={handleStandardTypeChange}
          className="h-8 w-full"
        >
          {Standards.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </>
  );
};

export default StepContent1;
