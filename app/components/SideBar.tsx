import {
  StepContent1,
  StepContent2,
  StepContent3,
  StepContent4,
} from "../steps";
import Button from "@mui/material/Button";
import { FC } from "react";
import { Problem } from "../types/problem";

const steps = ["1. General", "2. Specific", "3. Layout", "4. Modify"]; // Define the steps
type Alignment = "column" | "grid" | "rows";

interface SideBarProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setTopic: (topic: string) => void;
  onGenerateWorksheet: () => void;
  regenerateWorksheet: () => void;
  setActiveFormat: (format: number) => void;
  activeFormat: number;
  alignment: Alignment;
  setAlignment: (newAlignment: Alignment) => void;
  onRowsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onColumnsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rows: number;
  columns: number;
  numProblems: number;
  setAudience: (audience: string) => void;
  allImages: string[];
  changeBackground: (image: string) => void;
  problems: Problem[];
  showAnswers: boolean;
  backgroundImage: string;
  borderVisible: boolean;
  toggleBorderVisibility: () => void;
  toggleShowAnswers: () => void;
  setFontSize: (value: number) => void;
  setFontType: (value: string) => void;
  fontSize: number;
  fontType: string;
  pdfBlobUrl: string | any;
  setStandards: (value: string) => void;
  standards: string;
}

const SideBar: FC<SideBarProps> = ({
  currentStep,
  setCurrentStep,
  setTopic,
  onRowsChange,
  onColumnsChange,
  onNumsetChange,
  onGenerateWorksheet,
  regenerateWorksheet,
  setActiveFormat,
  activeFormat,
  alignment,
  setAlignment,
  rows,
  columns,
  numProblems,
  setAudience,
  allImages,
  changeBackground,
  problems,
  showAnswers,
  backgroundImage,
  borderVisible,
  toggleBorderVisibility,
  toggleShowAnswers,
  setFontSize,
  setFontType,
  fontSize,
  fontType,
  pdfBlobUrl,
  setStandards,
  standards,
}) => {
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAndNext = () => {
    onGenerateWorksheet();
    nextStep();
  };

  const renderStepContent = (stepIndex: number): JSX.Element => {
    switch (stepIndex) {
      case 0:
        return (
          <StepContent1
            setTopic={setTopic}
            setActiveFormat={setActiveFormat}
            activeFormat={activeFormat}
            setAudience={setAudience}
            setStandards={setStandards}
            standards={standards}
          />
        );
      case 1:
        return (
          <StepContent2
            alignment={alignment}
            setAlignment={setAlignment}
            onRowsChange={onRowsChange}
            onColumnsChange={onColumnsChange}
            onNumsetChange={onNumsetChange}
            rows={rows}
            columns={columns}
            numProblems={numProblems}
          />
        );
      case 2:
        return (
          <StepContent3
            allImages={allImages}
            changeBackground={changeBackground}
          />
        );
      case 3:
        return (
          <StepContent4
            regenerateWorksheet={regenerateWorksheet}
            toggleBorderVisibility={toggleBorderVisibility}
            toggleShowAnswers={toggleShowAnswers}
            setFontSize={setFontSize}
            setFontType={setFontType}
            pdfBlobUrl={pdfBlobUrl}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  // Function to handle step click
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isBeforeGenerateStep = currentStep < steps.length - 3;

  return (
    <>
      <div className="flex-1 flex-col">
        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              onClick={() => handleStepClick(index)}
              className={`flex-grow cursor-pointer px-4 py-3 text-center ${
                index === currentStep
                  ? "border-b border-gray-700"
                  : "border-b border-gray-100"
              }`}
            >
              <span
                className={`text-xs ${
                  index === currentStep ? "text-gray-700" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center overflow-y-auto px-8 ">
          {renderStepContent(currentStep)}
        </div>
      </div>
      {currentStep === 0 ? (
        <div className="flex justify-end p-1 pr-2 text-xs text-rose-700">
          <a className="hover:underline" href=".">
            Need inspiration? Explore creations!
          </a>
        </div>
      ) : (
        ""
      )}
      {/* Navigation controls */}
      <div className="flex items-center justify-between border-t px-8 pb-7 pt-3">
        <div className="text-lg font-extralight text-gray-300">{`${
          currentStep + 1
        }/${steps.length}`}</div>
        <div>
          <Button
            variant="outlined"
            color="primary"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="m-2 h-10"
            style={{ width: 120 }}
          >
            Prev
          </Button>
          {currentStep === steps.length - 1 ? (
            <a href={pdfBlobUrl} download="worksheet.pdf">
              <Button
                variant="contained"
                color="primary"
                className="h-10 bg-blue-400"
                style={{ width: 120 }}
              >
                Download
              </Button>
            </a>
          ) : currentStep === 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={generateAndNext}
              className="h-10 bg-blue-400"
              style={{ width: 120 }}
            >
              Generate
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={nextStep}
              className="h-10 bg-black"
              style={{ width: 120 }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;
