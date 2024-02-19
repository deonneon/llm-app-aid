import { useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  Slider,
  Typography,
  Box,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface StepContent4Props {
  regenerateWorksheet: () => void;
  toggleBorderVisibility: () => void;
  toggleShowAnswers: () => void;
  setFontSize: (fontSize: number) => void;
  setFontType: (fontType: string) => void;
  pdfBlobUrl: string | any;
}

const fontTypes = ["Courier", "Times-Roman", "Helvetica"];

const StepContent4: React.FC<StepContent4Props> = ({
  regenerateWorksheet,
  toggleBorderVisibility,
  toggleShowAnswers,
  setFontSize,
  setFontType,
  pdfBlobUrl,
}) => {
  const [selectedFontType, setSelectedFontType] = useState<string>(
    fontTypes[0],
  );
  const [fontSize, setFontSizeLocal] = useState<number>(12);
  const [complexity, setComplexity] = useState<number>(5);
  const [isSaved, setIsSaved] = useState(false);

  const handleFontTypeChange = (event: SelectChangeEvent) => {
    const newFontType = event.target.value;
    setSelectedFontType(newFontType);
    setFontType(newFontType);
  };

  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    setFontSizeLocal(newValue as number);
    setFontSize(newValue as number);
  };

  const increaseComplexity = () =>
    setComplexity((prev) => Math.min(prev + 1, 10));
  const decreaseComplexity = () =>
    setComplexity((prev) => Math.max(prev - 1, 1));

  const saveDraftToLocalStorage = async () => {
    if (pdfBlobUrl) {
      setIsSaved(true);
      const response = await fetch(pdfBlobUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const draftKey = `draftPDF_${new Date().getTime()}`; // Use a unique identifier, e.g., a timestamp
        localStorage.setItem(draftKey, base64data as string);
        setTimeout(() => setIsSaved(false), 3000);
      };
    }
  };

  return (
    <>
      <h1 className="flex pb-7 pt-12 text-xl font-light">Modify File</h1>
      <div className=" space-y-4">
        <Button
          variant="outlined"
          color="primary"
          className="w-full"
          onClick={regenerateWorksheet}
        >
          Regenerate Questions
        </Button>
        <Button
          variant="outlined"
          color={isSaved ? "success" : "primary"}
          className="w-full"
          onClick={saveDraftToLocalStorage}
          disabled={isSaved}
        >
          {isSaved ? "Draft Saved!" : "Save as Draft"}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          className="w-full"
          onClick={toggleShowAnswers}
        >
          Toggle Answer
        </Button>
        <Button
          variant="outlined"
          color="primary"
          className="w-full"
          onClick={toggleBorderVisibility}
        >
          Toggle Border
        </Button>

        <Box className="flex w-full flex-row justify-between">
          <Typography>Font Type</Typography>
          <Select
            value={selectedFontType}
            onChange={handleFontTypeChange}
            className="h-8 w-40"
          >
            {fontTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box className="flex flex-row">
          <Typography className="w-full">Font Size</Typography>
          <Slider
            value={fontSize}
            onChange={handleFontSizeChange}
            aria-labelledby="font-size-slider"
            valueLabelDisplay="auto"
            min={8}
            max={24}
            className="ml-16 w-full"
          />
        </Box>

        <Box
          className="flex w-full justify-between"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            disabled
            className="h-8"
            variant="outlined"
            onClick={decreaseComplexity}
          >
            -
          </Button>
          <Typography sx={{ marginX: 2 }}>
            Difficulty Level
            {/* Question Complexity: {complexity} */}
          </Typography>
          <Button
            disabled
            className="h-8"
            variant="outlined"
            onClick={increaseComplexity}
          >
            +
          </Button>
        </Box>
      </div>
    </>
  );
};

export default StepContent4;
